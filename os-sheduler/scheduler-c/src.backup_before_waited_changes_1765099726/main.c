#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>
#include "../include/scheduler.h"
#include "../include/process.h"
#include "../include/utils.h"

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

/* helper to compute metrics and print JSON summary */
static void print_metrics_summary(scheduler_t *sched, const char *algo_name, int injected) {
    if (!sched) return;
    size_t n = sched->completed_count;
    double total_wait = 0.0, total_turn = 0.0, total_resp = 0.0;
    unsigned long total_exec_time = sched->current_tick;
    unsigned long context_switches = sched->context_switches;

    printf("{\n  \"algorithm\": \"%s\",\n  \"injected\": %d,\n  \"ticks\": %lu,\n  \"context_switches\": %lu,\n  \"processes\": [\n", algo_name, injected, total_exec_time, context_switches);

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
        printf("    { \"pid\": %d, \"arrival\": %u, \"burst\": %d, \"start\": %u, \"finish\": %u, \"waiting\": %d, \"turnaround\": %u, \"response\": %u }%s\n",
               c->pid, c->arrival, c->burst, start, finish, waiting, turnaround, response, (i+1==n) ? "" : ",");
    }
    double avg_wait = n ? total_wait / (double)n : 0.0;
    double avg_turn = n ? total_turn / (double)n : 0.0;
    double avg_resp = n ? total_resp / (double)n : 0.0;
    printf("  ],\n  \"averages\": {\n    \"waiting_time\": %.3f,\n    \"turnaround_time\": %.3f,\n    \"response_time\": %.3f\n  }\n}\n",
           avg_wait, avg_turn, avg_resp);
}

int main(int argc, char *argv[]) {
    const char *algo_arg = (argc >= 2) ? argv[1] : "fcfs";
    sched_algo_t algo = parse_algo(algo_arg);

    printf("%s scheduler test starting...\n", algo_arg);

    process_t *pending[4];
    pending[0] = process_create(1, 0, 5, 1);
    pending[1] = process_create(2, 2, 3, 3);
    pending[2] = process_create(3, 4, 2, 2);
    pending[3] = NULL;

    scheduler_t *sched = scheduler_create(algo);
    if (!sched) {
        fprintf(stderr, "Failed to create scheduler\n");
        return 1;
    }

    /* If RR and quantum provided as argv[2], set it */
    if (algo == ALG_RR && argc >= 3) {
        unsigned long q = strtoul(argv[2], NULL, 10);
        if (q == 0) q = 1;
        sched->quantum = q;
        printf("Using quantum = %lu\n", sched->quantum);
    }

    int pending_count = 3;
    int injected = 0;

    while (pending_count > 0 || sched->ready_head != NULL || sched->running != NULL) {
        for (int i = 0; i < 3; ++i) {
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

    printf("%s scheduler test completed. Injected %d processes.\n", algo_arg, injected);

    /* Print metrics summary as JSON */
    print_metrics_summary(sched, algo_arg, injected);

    scheduler_destroy(sched);
    return 0;
}
