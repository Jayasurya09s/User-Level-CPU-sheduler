#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/srtf.h"
#include "../include/utils.h"
#include "../include/scheduler.h"

/* detach shortest remaining */
static process_t *detach_shortest_remaining(process_t **head) {
    if (!head || !*head) return NULL;
    process_t *best = *head, *best_prev = NULL, *prev = *head, *cur = (*head)->next;
    while (cur) {
        int better = 0;
        if (cur->remaining < best->remaining) better = 1;
        else if (cur->remaining == best->remaining) {
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

void srtf_tick(scheduler_t *s) {
    if (!s) return;

    process_t *candidate = NULL;
    if (s->ready_head) {
        process_t *cur = s->ready_head;
        process_t *best = cur;
        while (cur) {
            if (cur->remaining < best->remaining ||
               (cur->remaining == best->remaining && (cur->arrival < best->arrival ||
               (cur->arrival == best->arrival && cur->pid < best->pid)))) {
                best = cur;
            }
            cur = cur->next;
        }
        candidate = best;
    }

    if (s->running && candidate) {
        if (candidate->remaining < s->running->remaining) {
            process_t *det = detach_shortest_remaining(&s->ready_head);
            if (det) {
                char info_pre[128];
                snprintf(info_pre, sizeof(info_pre), "\"preempted_by\":%d", det->pid);
                char *ev = utils_build_event(EVT_JOB_PREEMPTED, s, s->running, info_pre);
                utils_emit_event_and_free(ev, EVT_JOB_PREEMPTED, s);

                s->running->state = PROC_READY;
                append_ready(&s->ready_head, s->running);

                s->running = det;
                s->running->state = PROC_RUNNING;
                if (s->running->start_time == UINT_MAX) s->running->start_time = s->current_tick;

                ev = utils_build_event(EVT_CONTEXT_SWITCH, s, s->running, NULL);
                utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
                ev = utils_build_event(EVT_JOB_STARTED, s, s->running, NULL);
                utils_emit_event_and_free(ev, EVT_JOB_STARTED, s);
            }
        }
    } else if (!s->running && s->ready_head) {
        process_t *p = detach_shortest_remaining(&s->ready_head);
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
