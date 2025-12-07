// src/sjf.c
// Shortest Job First (non-preemptive) scheduler implementation

#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include "scheduler.h"
#include "process.h"
#include "utils.h"
/* -- Fallback for PROC_FINISHED if not defined in headers -- */
#ifndef PROC_FINISHED
#define PROC_FINISHED 4
#endif
/* detach the process with the smallest burst time from s->ready_head.
 * This function also updates the process waited accounting (waited_total)
 * using s->current_tick. Returns the detached process (next == NULL).
 */
static process_t *detach_shortest(scheduler_t *s) {
    if (!s || !s->ready_head) return NULL;

    process_t *cur = s->ready_head;
    process_t *prev = NULL;

    process_t *best = cur;
    process_t *best_prev = NULL;

    /* find shortest burst (use original burst; if you prefer remaining, change to remaining) */
    while (cur) {
        if (!best || cur->burst < best->burst) {
            best = cur;
            best_prev = prev;
        }
        prev = cur;
        cur = cur->next;
    }

    if (!best) return NULL;

    /* unlink best from the ready list */
    if (!best_prev) {
        /* best was head */
        s->ready_head = best->next;
    } else {
        best_prev->next = best->next;
    }
    best->next = NULL;

    /* update waited accounting: add time since last enqueued till now */
    if (best->last_enqueued_tick != UINT_MAX) {
        if (s->current_tick >= best->last_enqueued_tick) {
            best->waited_total += (unsigned int)(s->current_tick - best->last_enqueued_tick);
        }
        best->last_enqueued_tick = UINT_MAX;
    }

    return best;
}

/* Called by scheduler loop each tick when SJF is the chosen algorithm. */
void sjf_tick(scheduler_t *s) {
    if (!s) return;

    /* If nothing is running and we have ready processes, pick the shortest */
    if (!s->running && s->ready_head) {
        process_t *p = detach_shortest(s);
        if (p) {
            p->next = NULL;
            s->running = p;
            p->state = PROC_RUNNING;

            /* If it's the first time this process runs, set start_time */
            if (p->start_time == UINT_MAX) {
                p->start_time = (unsigned int)s->current_tick;
            }

            /* context switch event */
            char *ev_ctx = utils_build_event(EVT_CONTEXT_SWITCH, s, p, NULL);
            utils_emit_event_and_free(ev_ctx, EVT_CONTEXT_SWITCH, s);

            /* job started event */
            char *ev_start = utils_build_event(EVT_JOB_STARTED, s, p, NULL);
            utils_emit_event_and_free(ev_start, EVT_JOB_STARTED, s);
        }
    }

    /* If a process is currently running, consume one tick of its remaining time */
    if (s->running) {
        /* emit gantt slice first (consistent with other algos) */
        char *ev_slice = utils_build_event(EVT_GANTT_SLICE, s, s->running, NULL);
        utils_emit_event_and_free(ev_slice, EVT_GANTT_SLICE, s);

        /* decrement remaining; note: remaining is int in many implementations */
        if (s->running->remaining > 0) {
            s->running->remaining--;
        }

        /* if finished, emit job finished and record it */
        if (s->running->remaining == 0) {
            s->running->state = PROC_FINISHED;
            s->running->finish_time = (unsigned int)s->current_tick;

            char *ev_fin = utils_build_event(EVT_JOB_FINISHED, s, s->running, NULL);
            utils_emit_event_and_free(ev_fin, EVT_JOB_FINISHED, s);

            /* snapshot completed process metrics */
            scheduler_record_completed(s, s->running);

            /* clear running slot */
            s->running = NULL;
        }
    }
}

/* optional: if build system expects a symbol to register the algorithm name,
   you can add an init or registration function here. If not required, ignore. */
