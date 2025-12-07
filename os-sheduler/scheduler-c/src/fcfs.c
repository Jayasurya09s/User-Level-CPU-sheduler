#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/fcfs.h"
#include "../include/utils.h"
#include "../include/scheduler.h"

void fcfs_tick(scheduler_t *s) {
    if (!s) return;

    if (!s->running && s->ready_head) {
        /* dispatch head */
        process_t *p = scheduler_pop_head(s);

        p->next = NULL;
        s->running = p;
        p->state = PROC_RUNNING;

        char *ev = utils_build_event(EVT_CONTEXT_SWITCH, s, p, NULL);
        utils_emit_event_and_free(ev, EVT_CONTEXT_SWITCH, s);

        if (p->remaining == p->burst) {
            if (p->start_time == UINT_MAX) p->start_time = s->current_tick;
            ev = utils_build_event(EVT_JOB_STARTED, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_JOB_STARTED, s);
        } else {
            ev = utils_build_event(EVT_JOB_RESUMED, s, p, NULL);
            utils_emit_event_and_free(ev, EVT_JOB_RESUMED, s);
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
            /* record completed snapshot then free */
            scheduler_record_completed(s, s->running);
            process_free(s->running);
            s->running = NULL;
        }
    }
}
