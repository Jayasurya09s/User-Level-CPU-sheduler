#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "../include/scheduler.h"
#include "../include/utils.h"
#include "../include/fcfs.h"
#include "../include/sjf.h"
#include "../include/srtf.h"
#include "../include/priority.h"
#include "../include/priority_p.h"
#include "../include/rr.h"
#include "../include/mlfq.h"

/* local ensure for completed array allocation */
static int ensure_completed_capacity_local(scheduler_t *s) {
    if (!s) return 0;
    if (s->completed_count < s->completed_capacity) return 1;
    size_t newcap = s->completed_capacity ? s->completed_capacity * 2 : 8;
    completed_proc_t *arr = (completed_proc_t *)realloc(s->completed, newcap * sizeof(completed_proc_t));
    if (!arr) return 0;
    s->completed = arr;
    s->completed_capacity = newcap;
    return 1;
}

scheduler_t *scheduler_create(sched_algo_t algo) {
    scheduler_t *s = (scheduler_t *)calloc(1, sizeof(scheduler_t));
    if (!s) return NULL;
    s->algo = algo;
    s->current_tick = 0;
    s->quantum = 0;
    s->ready_head = NULL;
    s->running = NULL;
    s->context_switches = 0;
    s->completed = NULL;
    s->completed_count = 0;
    s->completed_capacity = 0;
    return s;
}

void scheduler_destroy(scheduler_t *s) {
    if (!s) return;
    /* free queued processes */
    process_t *cur = s->ready_head;
    while (cur) {
        process_t *n = cur->next;
        process_free(cur);
        cur = n;
    }
    if (s->running) process_free(s->running);
    if (s->completed) free(s->completed);
    free(s);
}

void scheduler_add_process(scheduler_t *s, process_t *p) {
    if (!s || !p) return;
    p->next = NULL;
    p->state = PROC_READY;
    /* mark enqueue time for precise waiting accounting */
    p->last_enqueued_tick = (unsigned int)s->current_tick;
    if (!s->ready_head) s->ready_head = p;
    else {
        process_t *cur = s->ready_head;
        while (cur->next) cur = cur->next;
        cur->next = p;
    }
}

/* Pop head from ready queue and adjust waited_total for the popped process.
 * Returns the popped process (caller becomes responsible for it).
 */
process_t *scheduler_pop_head(scheduler_t *s) {
    if (!s || !s->ready_head) return NULL;
    process_t *p = s->ready_head;
    s->ready_head = p->next;
    p->next = NULL;

    if (p->last_enqueued_tick != UINT_MAX) {
        if (s->current_tick >= p->last_enqueued_tick) {
            p->waited_total += (unsigned int)(s->current_tick - p->last_enqueued_tick);
        }
        p->last_enqueued_tick = UINT_MAX;
    }
    return p;
}


process_t *scheduler_remove_process(scheduler_t *s, int pid) {
    if (!s || !s->ready_head) return NULL;
    process_t *cur = s->ready_head, *prev = NULL;
    while (cur) {
        if (cur->pid == pid) {
            if (prev) prev->next = cur->next;
            else s->ready_head = cur->next;
            cur->next = NULL;
            return cur;
        }
        prev = cur;
        cur = cur->next;
    }
    return NULL;
}

void scheduler_tick(scheduler_t *s) {
    if (!s) return;
    s->current_tick++;
    char *ev = utils_build_event(EVT_TICK, s, NULL, NULL);
    utils_emit_event_and_free(ev, EVT_TICK, s);

    switch (s->algo) {
        case ALG_FCFS: fcfs_tick(s); break;
        case ALG_SJF: sjf_tick(s); break;
        case ALG_SRTF: srtf_tick(s); break;
        case ALG_PRIORITY: priority_tick(s); break;
        case ALG_PRIORITY_P: priority_p_tick(s); break;
        case ALG_RR: rr_tick(s); break;
        case ALG_MLFQ: mlfq_tick(s); break;
        default: break;
    }
}

void scheduler_record_completed(scheduler_t *s, const process_t *p) {
    if (!s || !p) return;
    if (!ensure_completed_capacity_local(s)) {
        return;
    }
    completed_proc_t *slot = &s->completed[s->completed_count++];
    slot->pid = p->pid;
    slot->arrival = p->arrival;
    slot->burst = p->burst;
    slot->start_time = (p->start_time == UINT_MAX) ? p->finish_time : p->start_time;
    slot->finish_time = p->finish_time;
    slot->priority = p->priority;
}
