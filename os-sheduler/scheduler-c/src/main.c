#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>
#include <ctype.h>
#include "../include/scheduler.h"
#include "../include/process.h"
#include "../include/utils.h"

#define MAX_PROCESSES 1000

static sched_algo_t parse_algo(const char *name) {
    if (!name) return ALG_FCFS;
    if (strcmp(name, "fcfs") == 0) return ALG_FCFS;
    if (strcmp(name, "sjf") == 0) return ALG_SJF;
    if (strcmp(name, "srtf") == 0) return ALG_SRTF;
    if (strcmp(name, "priority") == 0) return ALG_PRIORITY;
    if (strcmp(name, "priority_p") == 0) return ALG_PRIORITY_P;
    if (strcmp(name, "rr") == 0) return ALG_RR;
    if (strcmp(name, "mlfq") == 0) return ALG_MLFQ;
    return ALG_FCFS;
}

/* Simple JSON parser for workload file */
static int parse_workload_json(const char *filename, process_t **processes, int *count) {
    FILE *fp = fopen(filename, "r");
    if (!fp) {
        fprintf(stderr, "Error: Cannot open workload file: %s\n", filename);
        return -1;
    }

    fseek(fp, 0, SEEK_END);
    long fsize = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    char *content = malloc(fsize + 1);
    if (!content) {
        fclose(fp);
        return -1;
    }
    fread(content, 1, fsize, fp);
    content[fsize] = '\0';
    fclose(fp);

    /* Simple JSON array parser - assumes format: [{"pid":1,"arrival_time":0,"burst_time":5,"priority":1},...] */
    int proc_count = 0;
    char *p = strchr(content, '[');
    if (!p) {
        free(content);
        fprintf(stderr, "Error: Invalid JSON format (no opening bracket)\n");
        return -1;
    }
    p++; /* skip '[' */

    while (*p && proc_count < MAX_PROCESSES) {
        /* Skip whitespace */
        while (*p && isspace(*p)) p++;
        if (*p == ']') break;
        if (*p != '{') break;

        int pid = -1, arrival = 0, burst = 1, priority = 1;
        
        /* Find pid */
        char *pid_str = strstr(p, "\"pid\"");
        if (pid_str) {
            pid_str = strchr(pid_str, ':');
            if (pid_str) pid = atoi(pid_str + 1);
        }

        /* Find arrival_time or arrival */
        char *arrival_str = strstr(p, "\"arrival_time\"");
        if (!arrival_str) {
            arrival_str = strstr(p, "\"arrival\"");
        }
        if (arrival_str) {
            arrival_str = strchr(arrival_str, ':');
            if (arrival_str) arrival = atoi(arrival_str + 1);
        }

        /* Find burst_time or burst */
        char *burst_str = strstr(p, "\"burst_time\"");
        if (!burst_str) {
            burst_str = strstr(p, "\"burst\"");
        }
        if (burst_str) {
            burst_str = strchr(burst_str, ':');
            if (burst_str) burst = atoi(burst_str + 1);
        }

        /* Find priority */
        char *priority_str = strstr(p, "\"priority\"");
        if (priority_str) {
            priority_str = strchr(priority_str, ':');
            if (priority_str) priority = atoi(priority_str + 1);
        }

        if (pid >= 0 && burst > 0) {
            processes[proc_count] = process_create(pid, arrival, burst, priority);
            proc_count++;
        }

        /* Move to next object */
        p = strchr(p, '}');
        if (!p) break;
        p++;
        while (*p && (isspace(*p) || *p == ',')) p++;
    }

    free(content);
    *count = proc_count;
    fprintf(stderr, "Loaded %d processes from %s\n", proc_count, filename);
    return 0;
}

/* helper to compute metrics and print JSON summary (single-line for proper parsing) */
static void print_metrics_summary(scheduler_t *sched, const char *algo_name, int injected) {
    if (!sched) return;
    size_t n = sched->completed_count;
    double total_wait = 0.0, total_turn = 0.0, total_resp = 0.0;
    unsigned long total_exec_time = sched->current_tick;
    unsigned long context_switches = sched->context_switches;

    /* Print single-line JSON */
    printf("{\"algorithm\":\"%s\",\"injected\":%d,\"ticks\":%lu,\"context_switches\":%lu,\"processes\":[", 
           algo_name, injected, total_exec_time, context_switches);

    for (size_t i = 0; i < n; ++i) {
        completed_proc_t *c = &sched->completed[i];
        unsigned int start = c->start_time;
        unsigned int finish = c->finish_time;
        if (start == UINT_MAX) start = finish; /* defensive */
        unsigned int turnaround = finish - c->arrival;
        int waiting = (int)turnaround - c->burst;
        unsigned int response = start - c->arrival;
        total_wait += waiting;
        total_turn += turnaround;
        total_resp += response;
        printf("{\"pid\":%d,\"arrival\":%u,\"burst\":%d,\"priority\":%d,\"start\":%u,\"finish\":%u,\"waiting\":%d,\"turnaround\":%u,\"response\":%u}%s",
               c->pid, c->arrival, c->burst, c->priority, start, finish, waiting, turnaround, response, (i+1==n) ? "" : ",");
    }
    double avg_wait = n ? total_wait / (double)n : 0.0;
    double avg_turn = n ? total_turn / (double)n : 0.0;
    double avg_resp = n ? total_resp / (double)n : 0.0;
    printf("],\"averages\":{\"waiting_time\":%.3f,\"turnaround_time\":%.3f,\"response_time\":%.3f}}\n",
           avg_wait, avg_turn, avg_resp);
}

int main(int argc, char *argv[]) {
    const char *algo_arg = (argc >= 2) ? argv[1] : "fcfs";
    sched_algo_t algo = parse_algo(algo_arg);

    /* Load processes from JSON file if provided */
    process_t *pending[MAX_PROCESSES];
    int pending_count = 0;
    
    /* Find JSON file in arguments - last arg should be the file path */
    const char *json_file = NULL;
    for (int i = argc - 1; i >= 2; i--) {
        if (strstr(argv[i], ".json")) {
            json_file = argv[i];
            break;
        }
    }

    if (json_file) {
        if (parse_workload_json(json_file, pending, &pending_count) < 0) {
            fprintf(stderr, "Failed to parse workload JSON\n");
            return 1;
        }
    } else {
        /* Fallback to hardcoded processes if no JSON file */
        fprintf(stderr, "No JSON file provided, using default workload\n");
        pending[0] = process_create(0, 0, 5, 1);
        pending[1] = process_create(1, 2, 3, 3);
        pending[2] = process_create(2, 4, 2, 2);
        pending_count = 3;
    }

    if (pending_count == 0) {
        fprintf(stderr, "Error: No processes to schedule\n");
        return 1;
    }

    scheduler_t *sched = scheduler_create(algo);
    if (!sched) {
        fprintf(stderr, "Failed to create scheduler\n");
        return 1;
    }

    /* Set quantum for RR - check for numeric argument before JSON file */
    if (algo == ALG_RR && argc >= 3) {
        for (int i = 2; i < argc; i++) {
            if (!strstr(argv[i], ".json")) {
                unsigned long q = strtoul(argv[i], NULL, 10);
                if (q > 0) {
                    sched->quantum = q;
                    fprintf(stderr, "Using quantum = %lu\n", sched->quantum);
                    break;
                }
            }
        }
    }

    int injected = 0;
    int original_count = pending_count;

    /* Main scheduling loop */
    while (pending_count > 0 || sched->ready_head != NULL || sched->running != NULL) {
        /* Inject arriving processes */
        for (int i = 0; i < original_count; ++i) {
            process_t *p = pending[i];
            if (p && p->arrival <= sched->current_tick) {
                char info[128];
                snprintf(info, sizeof(info), "\"pid\":%d, \"arrival\":%u", p->pid, p->arrival);
                char *ev = utils_build_event(EVT_JOB_RESUMED, sched, p, info);
                utils_emit_event_and_free(ev, EVT_JOB_RESUMED, sched);

                scheduler_add_process(sched, p);
                pending[i] = NULL;
                pending_count--;
                injected++;
            }
        }

        scheduler_tick(sched);
    }

    /* Print metrics summary as JSON (single-line for proper JSON parsing) */
    print_metrics_summary(sched, algo_arg, injected);

    scheduler_destroy(sched);
    return 0;
}
