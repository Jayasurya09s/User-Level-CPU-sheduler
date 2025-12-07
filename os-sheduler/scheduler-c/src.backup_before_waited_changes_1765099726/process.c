#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "../include/process.h"

process_t *process_create(int pid, unsigned int arrival, int burst, int priority) {
    process_t *p = (process_t *)calloc(1, sizeof(process_t));
    if (!p) return NULL;
    p->pid = pid;
    p->arrival = arrival;
    p->burst = burst;
    p->remaining = burst;
    p->priority = priority;
    p->os_pid = 0;
    p->state = PROC_NEW;
    p->quantum_left = 0;
    p->mlfq_level = 0;
    p->waited = 0;
    p->start_time = UINT_MAX;
    p->finish_time = UINT_MAX;

    /* new fields */
    p->waited_total = 0;
    p->last_enqueued_tick = UINT_MAX;

    p->next = NULL;
    return p;
}

process_t *process_clone(const process_t *src) {
    if (!src) return NULL;
    process_t *p = (process_t *)calloc(1, sizeof(process_t));
    if (!p) return NULL;
    memcpy(p, src, sizeof(process_t));
    p->next = NULL; /* clone has no links */
    return p;
}

void process_free(process_t *p) {
    if (!p) return;
    free(p);
}
