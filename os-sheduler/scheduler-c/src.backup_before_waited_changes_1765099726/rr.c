#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "../include/rr.h"
#include "../include/utils.h"
#include "../include/scheduler.h"

static void append_ready(process_t **head, process_t *p) {
    if (!head || !p) return;
    p->next = NULL;
    if (!*head) *head = p;
    else {
        process_t *cur = *head;
        while (cur->next) cur = cur->next;
        cur->next = p;
    }
}

static process_t *detach_head(process_t **head) {
    if (!head || !*head) return NULL;
    process_t *p = *head;
    *head = p->next;
    p->next = NULL;
    return p;
}

void rr_tick(scheduler_t *s) {
    if (!s) return;

    if (!s->running) {
        process_t *p = scheduler_pop_head(s);
        if (p) {
            s->running = p;
            p->state = PROC_RUNNING;
            if (s->quantum > 0) p->quantum_left = (int)s->quantum;
            else p->quantum_left = 0;
            if (p->start_time == UINT_MAX) p->start_time = s->current_tick;

            char *ev = utils_build_event(EVT_CONTEXT_SWITCH, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
            if (p->remaining == p->burst) ev = utils_build_event(EVT_JOB_STARTED, s, p, NULL);
            else ev = utils_build_event(EVT_JOB_RESUMED, s, p, NULL);
            utils_emit_event_and_free(ev, (p->remaining == p->burst) ? EVT_JOB_STARTED : EVT_JOB_RESUMED, s);
        }
    }

    if (s->running) {
        if (s->running->remaining > 0) s->running->remaining -= 1;
        if (s->quantum > 0 && s->running->quantum_left > 0) s->running->quantum_left -= 1;

        char info[128];
        snprintf(info, sizeof(info), "\"pid\":%d, \"remaining\":%d, \"quantum_left\":%d",
                 s->running->pid, s->running->remaining, s->running->quantum_left);
        char *ev = utils_build_event(EVT_GANTT_SLICE, s, s->running, info);
        utils_emit_event_and_free(ev, EVT_GANTT_SLICE, s);

        if (s->running->remaining <= 0) {
            s->running->state = PROC_TERMINATED;
            s->running->finish_time = s->current_tick;
            ev = utils_build_event(EVT_JOB_FINISHED, s, s->running, NULL);
            utils_emit_event_and_free(ev, EVT_JOB_FINISHED, s);
            scheduler_record_completed(s, s->running);
            process_free(s->running);
            s->running = NULL;
            return;
        }

        if (s->quantum > 0 && s->running->quantum_left <= 0) {
            char info_pre[128];
            snprintf(info_pre, sizeof(info_pre), "\"reason\":\"quantum\"");
            char *pev = utils_build_event(EVT_JOB_PREEMPTED, s, s->running, info_pre);
            utils_emit_event_and_free(pev, EVT_JOB_PREEMPTED, s);

            s->running->state = PROC_READY;
            scheduler_add_process(s, s->running);
            s->running = NULL;

            process_t *next = scheduler_pop_head(s);
            if (next) {
                s->running = next;
                next->state = PROC_RUNNING;
                if (s->quantum > 0) next->quantum_left = (int)s->quantum;
                else next->quantum_left = 0;
                if (next->start_time == UINT_MAX) next->start_time = s->current_tick;

                char *ev = utils_build_event(EVT_CONTEXT_SWITCH, s, next, NULL);
                utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
                if (next->remaining == next->burst) ev = utils_build_event(EVT_JOB_STARTED, s, next, NULL);
                else ev = utils_build_event(EVT_JOB_RESUMED, s, next, NULL);
                utils_emit_event_and_free(ev, (next->remaining == next->burst) ? EVT_JOB_STARTED : EVT_JOB_RESUMED, s);
            }
        }
    }
}
