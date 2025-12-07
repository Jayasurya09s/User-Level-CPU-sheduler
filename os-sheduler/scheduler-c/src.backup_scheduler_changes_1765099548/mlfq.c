#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "../include/mlfq.h"
#include "../include/utils.h"
#include "../include/scheduler.h"
#include "../include/process.h"

/* Tunables */
static const int LEVELS = 3;
static const int time_slices[] = {1,2,4};
static const unsigned int AGING_THRESHOLD = 10;

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

static process_t *detach_best_by_level(process_t **head) {
    if (!head || !*head) return NULL;
    process_t *best = *head, *best_prev = NULL, *prev = *head, *cur = (*head)->next;
    while (cur) {
        int better = 0;
        if (cur->mlfq_level < best->mlfq_level) better = 1;
        else if (cur->mlfq_level == best->mlfq_level) {
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

static void apply_aging(process_t *head) {
    process_t *cur = head;
    while (cur) {
        if (cur->state == PROC_READY && cur->waited >= AGING_THRESHOLD) {
            if (cur->mlfq_level > 0) cur->mlfq_level -= 1;
            cur->waited = 0;
        }
        cur = cur->next;
    }
}

void mlfq_tick(scheduler_t *s) {
    if (!s) return;
    apply_aging(s->ready_head);

    process_t *candidate = NULL;
    if (s->ready_head) {
        process_t *cur = s->ready_head;
        process_t *best = cur;
        while (cur) {
            if (cur->mlfq_level < best->mlfq_level ||
               (cur->mlfq_level == best->mlfq_level && (cur->arrival < best->arrival ||
               (cur->arrival == best->arrival && cur->pid < best->pid)))) {
                best = cur;
            }
            cur = cur->next;
        }
        candidate = best;
    }

    if (s->running && candidate) {
        if (candidate->mlfq_level < s->running->mlfq_level) {
            process_t *det = detach_best_by_level(&s->ready_head);
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

                int level = s->running->mlfq_level;
                if (level < 0) level = 0;
                if (level >= LEVELS) level = LEVELS - 1;
                s->running->quantum_left = time_slices[level];

                ev = utils_build_event(EVT_CONTEXT_SWITCH, s, s->running, NULL);
                utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
                if (s->running->remaining == s->running->burst) ev = utils_build_event(EVT_JOB_STARTED, s, s->running, NULL);
                else ev = utils_build_event(EVT_JOB_RESUMED, s, s->running, NULL);
                utils_emit_event_and_free(ev, (s->running->remaining == s->running->burst) ? EVT_JOB_STARTED : EVT_JOB_RESUMED, s);
            }
        }
    } else if (!s->running && s->ready_head) {
        process_t *p = detach_best_by_level(&s->ready_head);
        if (p) {
            s->running = p;
            p->state = PROC_RUNNING;
            if (p->start_time == UINT_MAX) p->start_time = s->current_tick;
            int level = p->mlfq_level;
            if (level < 0) level = 0;
            if (level >= LEVELS) level = LEVELS - 1;
            p->quantum_left = time_slices[level];

            char *ev = utils_build_event(EVT_CONTEXT_SWITCH, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);
            if (p->remaining == p->burst) ev = utils_build_event(EVT_JOB_STARTED, s, p, NULL);
            else ev = utils_build_event(EVT_JOB_RESUMED, s, p, NULL);
            utils_emit_event_and_free(ev, (p->remaining == p->burst) ? EVT_JOB_STARTED : EVT_JOB_RESUMED, s);
        }
    }

    if (s->running) {
        if (s->running->remaining > 0) s->running->remaining -= 1;
        if (s->running->quantum_left > 0) s->running->quantum_left -= 1;

        char info[256];
        snprintf(info, sizeof(info), "\"pid\":%d, \"remaining\":%d, \"mlfq_level\":%d, \"quantum_left\":%d",
                 s->running->pid, s->running->remaining, s->running->mlfq_level, s->running->quantum_left);
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
        } else if (s->running->quantum_left <= 0) {
            if (s->running->mlfq_level < LEVELS - 1) s->running->mlfq_level += 1;
            char info_pre[128];
            snprintf(info_pre, sizeof(info_pre), "\"reason\":\"quantum\", \"demoted_to\":%d", s->running->mlfq_level);
            char *pev = utils_build_event(EVT_JOB_PREEMPTED, s, s->running, info_pre);
            utils_emit_event_and_free(pev, EVT_JOB_PREEMPTED, s);

            s->running->state = PROC_READY;
            append_ready(&s->ready_head, s->running);
            s->running = NULL;

            if (s->ready_head) {
                process_t *next = detach_best_by_level(&s->ready_head);
                if (next) {
                    s->running = next;
                    next->state = PROC_RUNNING;
                    if (next->start_time == UINT_MAX) next->start_time = s->current_tick;
                    int level = next->mlfq_level;
                    if (level < 0) level = 0;
                    if (level >= LEVELS) level = LEVELS - 1;
                    next->quantum_left = time_slices[level];

                    char *ev2 = utils_build_event(EVT_CONTEXT_SWITCH, s, next, NULL);
                    utils_emit_event_and_free(ev2, EVT_CONTEXT_SWITCH, s);
                    if (next->remaining == next->burst) ev2 = utils_build_event(EVT_JOB_STARTED, s, next, NULL);
                    else ev2 = utils_build_event(EVT_JOB_RESUMED, s, next, NULL);
                    utils_emit_event_and_free(ev2, (next->remaining == next->burst) ? EVT_JOB_STARTED : EVT_JOB_RESUMED, s);
                }
            }
        }
    }

    process_t *cur = s->ready_head;
    while (cur) {
        if (cur->state == PROC_READY) cur->waited += 1;
        cur = cur->next;
    }
}
