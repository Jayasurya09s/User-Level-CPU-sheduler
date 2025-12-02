#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <time.h>
#include <signal.h>
#include <errno.h>

#define MAX_JOBS 128

typedef enum { NEW=0, READY, RUNNING, STOPPED, FINISHED } state_t;

typedef struct {
    int job_id;
    pid_t pid;
    char *cmd;
    char **argv;
    state_t state;
    double start_time;
    double end_time;
} job_t;

static job_t jobs[MAX_JOBS];
static int job_count = 0;
static int running_job = -1;

static double now_seconds() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}

/* JSON emitters */
static void emit_running(int id, pid_t pid) {
    printf("{\"type\":\"running\",\"job_id\":%d,\"pid\":%d,\"timestamp\":%.6f}\n",
        id, pid, now_seconds());
    fflush(stdout);
}

static void emit_stopped(int id, pid_t pid, const char *reason) {
    printf("{\"type\":\"stopped\",\"job_id\":%d,\"pid\":%d,\"reason\":\"%s\",\"timestamp\":%.6f}\n",
        id, pid, reason, now_seconds());
    fflush(stdout);
}

static void emit_finished(int id, pid_t pid, int ec) {
    printf("{\"type\":\"finished\",\"job_id\":%d,\"pid\":%d,\"exit_code\":%d,\"timestamp\":%.6f}\n",
        id, pid, ec, now_seconds());
    fflush(stdout);
}

/* Very simple argv splitter */
static char **parse_argv(const char *cmd) {
    char *copy = strdup(cmd);
    char *tok = strtok(copy, " ");
    int cap = 8, count = 0;

    char **argv = malloc(sizeof(char*) * cap);

    while (tok) {
        if (count + 1 >= cap) {
            cap *= 2;
            argv = realloc(argv, sizeof(char*) * cap);
        }
        argv[count++] = strdup(tok);
        tok = strtok(NULL, " ");
    }

    argv[count] = NULL;
    free(copy);
    return argv;
}

/* Launch jobs and immediately SIGSTOP children */
static void launch_jobs() {
    for (int i = 0; i < job_count; i++) {
        pid_t pid = fork();
        if (pid < 0) {
            fprintf(stderr, "fork failed\n");
            exit(1);
        }

        if (pid == 0) {
            execvp(jobs[i].argv[0], jobs[i].argv);
            fprintf(stderr, "execvp failed\n");
            _exit(1);
        }

        jobs[i].pid = pid;
        jobs[i].state = READY;
        kill(pid, SIGSTOP);
    }
}

/* Reaps any finished child */
static void reap_children() {
    int status;
    pid_t pid;

    while ((pid = waitpid(-1, &status, WNOHANG)) > 0) {
        for (int i = 0; i < job_count; i++) {
            if (jobs[i].pid == pid) {
                jobs[i].state = FINISHED;
                jobs[i].end_time = now_seconds();
                int ec = WIFEXITED(status) ? WEXITSTATUS(status) : -1;
                emit_finished(jobs[i].job_id, pid, ec);
                if (running_job == i) running_job = -1;
            }
        }
    }
}

/* FCFS scheduler: run jobs to completion */
static void scheduler_fcfs() {
    for (int i = 0; i < job_count; i++) {
        if (jobs[i].state != READY) continue;

        kill(jobs[i].pid, SIGCONT);
        jobs[i].start_time = now_seconds();
        jobs[i].state = RUNNING;
        running_job = i;
        emit_running(jobs[i].job_id, jobs[i].pid);

        int status;
        waitpid(jobs[i].pid, &status, 0);
        jobs[i].state = FINISHED;
        jobs[i].end_time = now_seconds();
        int ec = WIFEXITED(status) ? WEXITSTATUS(status) : -1;
        emit_finished(jobs[i].job_id, jobs[i].pid, ec);
        running_job = -1;
    }
}

/* RR scheduler */
static void scheduler_rr(long quantum_ms) {
    int remaining;

    do {
        remaining = 0;
        for (int i = 0; i < job_count; i++) {
            if (jobs[i].state == FINISHED)
                continue;

            remaining++;

            if (jobs[i].state == READY) {
                kill(jobs[i].pid, SIGCONT);
                if (jobs[i].start_time == 0)
                    jobs[i].start_time = now_seconds();
                jobs[i].state = RUNNING;
                running_job = i;
                emit_running(jobs[i].job_id, jobs[i].pid);

                struct timespec ts;
                ts.tv_sec = quantum_ms / 1000;
                ts.tv_nsec = (quantum_ms % 1000) * 1000000L;
                nanosleep(&ts, NULL);

                if (kill(jobs[i].pid, SIGSTOP) == 0) {
                    emit_stopped(jobs[i].job_id, jobs[i].pid, "quantum_expired");
                    jobs[i].state = READY;
                }
                running_job = -1;
            }
        }

        reap_children();
        struct timespec sl = {0, 2 * 1000000L}; // 2ms
        nanosleep(&sl, NULL);

    } while (remaining > 0);
}

/* CLEANUP */
static void free_jobs() {
    for (int i = 0; i < job_count; i++) {
        free(jobs[i].cmd);
        for (char **p = jobs[i].argv; p && *p; p++) free(*p);
        free(jobs[i].argv);
    }
}

/* MAIN */
int main(int argc, char **argv) {
    if (argc < 3) {
        fprintf(stderr, "Usage:\n");
        fprintf(stderr, "  %s fcfs <job1> <job2>\n", argv[0]);
        fprintf(stderr, "  %s rr <quantum_ms> <job1> <job2>\n", argv[0]);
        return 1;
    }

    char *mode = argv[1];
    long quantum = 0;
    int start = 2;

    if (strcmp(mode, "rr") == 0) {
        if (argc < 4) {
            fprintf(stderr, "rr needs quantum + jobs\n");
            return 1;
        }
        quantum = atol(argv[2]);
        start = 3;
    }

    job_count = 0;
    for (int i = start; i < argc; i++) {
        jobs[job_count].job_id = job_count;
        jobs[job_count].cmd = strdup(argv[i]);
        jobs[job_count].argv = parse_argv(argv[i]);
        jobs[job_count].state = NEW;
        job_count++;
    }

    launch_jobs();

    if (strcmp(mode, "fcfs") == 0)
        scheduler_fcfs();
    else
        scheduler_rr(quantum);

    reap_children();
    free_jobs();
    return 0;
}
