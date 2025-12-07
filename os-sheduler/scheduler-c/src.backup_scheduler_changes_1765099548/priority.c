#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/priority.h"
#include "../include/utils.h"
#include "../include/scheduler.h"

static process_t *detach_highest_priority(process_t **head) {
    if (!head || !*head) return NULL;
    process_t *best = *head, *best_prev = NULL, *prev = *head, *cur = (*head)->next;
    while (cur) {
        int better = 0;
        if (cur->priority < best->priority) better = 1;
        else if (cur->priority == best->priority) {
            if (cur->arrival < best->arrival) better = 1;
            else if (cur->arrival == best->arrival && cur->pid < best->pid) better = 1;
        }
        if (better) {
            best_prev = prev;
            best = cur;
        }
        prev = cur;
        cur = cur->next;
    }
    if (best_prev) best_prev->next = best->next;
    else *head = best->next;
    best->next = NULL;
    return best;
}

void priority_tick(scheduler_t *s) {
    if (!s) return;

    if (!s->running) {
        process_t *p = detach_highest_priority(&s->ready_head);
        if (p) {
            s->running = p;
            p->state = PROC_RUNNING;
            if (p->start_time == UINT_MAX) p->start_time = s->current_tick;

            char *ev = utils_build_event(EVT_CONTEXT_SWITCH, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
            ev = utils_build_event(EVT_JOB_STARTED, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_JOB_STARTED, s);
        }
    }

    if (s->running) {
        if (s->running->remaining > 0) s->running->remaining -= 1;
        char info[128];
        snprintf(info, sizeof(info), "\"pid\":%d, \"remaining\":%d", s->running->pid, s->running->remaining);
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
        }
    }
}
