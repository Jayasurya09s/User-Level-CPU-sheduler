#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "../include/utils.h"
#include "../include/scheduler.h"

static const char *event_type_str(event_type_t t) {
    switch (t) {
        case EVT_TICK: return "tick";
        case EVT_JOB_STARTED: return "job_started";
        case EVT_JOB_PREEMPTED: return "job_preempted";
        case EVT_JOB_RESUMED: return "job_resumed";
        case EVT_JOB_FINISHED: return "job_finished";
        case EVT_CONTEXT_SWITCH: return "context_switch";
        case EVT_GANTT_SLICE: return "gantt_slice";
        default: return "unknown";
    }
}

char *utils_build_event(event_type_t type, const scheduler_t *sched, const process_t *proc, const char *event_info) {
    char *json = NULL;
    const char *etype = event_type_str(type);

    if (proc) {
        if (event_info) {
            (void) asprintf(&json,
                "{ \"event\": \"%s\", \"tick\": %lu, \"pid\": %d, \"state\": \"%d\", %s }",
                etype, sched ? sched->current_tick : 0UL, proc->pid, (int)proc->state, event_info);
        } else {
            (void) asprintf(&json,
                "{ \"event\": \"%s\", \"tick\": %lu, \"pid\": %d, \"state\": \"%d\", \"arrival\": %u, \"burst\": %d, \"remaining\": %d, \"priority\": %d }",
                etype, sched ? sched->current_tick : 0UL,
                proc->pid, (int)proc->state, proc->arrival, proc->burst, proc->remaining, proc->priority);
        }
    } else {
        if (event_info) {
            (void) asprintf(&json,
                "{ \"event\": \"%s\", \"tick\": %lu, %s }",
                etype, sched ? sched->current_tick : 0UL, event_info);
        } else {
            (void) asprintf(&json,
                "{ \"event\": \"%s\", \"tick\": %lu }",
                etype, sched ? sched->current_tick : 0UL);
        }
    }
    return json;
}

/* Ensure scheduler has capacity to store one more completed snapshot */
static int ensure_completed_capacity(scheduler_t *s) {
    if (!s) return 0;
    if (s->completed_count < s->completed_capacity) return 1;
    size_t newcap = s->completed_capacity ? s->completed_capacity * 2 : 8;
    completed_proc_t *arr = (completed_proc_t *)realloc(s->completed, newcap * sizeof(completed_proc_t));
    if (!arr) return 0;
    s->completed = arr;
    s->completed_capacity = newcap;
    return 1;
}

void utils_emit_event_and_free(char *event_json, event_type_t type, scheduler_t *sched) {
    if (!event_json) return;

    /* print the event first */
    puts(event_json);

    /* Update metrics where appropriate */
    if (sched) {
        switch (type) {
            case EVT_CONTEXT_SWITCH:
                sched->context_switches++;
                break;
            case EVT_JOB_STARTED:
                /* set process start_time handled elsewhere (we have only a JSON string here) */
                /* Nothing here; handled in callers via process pointer when calling utils_build_event + utils_emit_event_and_free */
                break;
            case EVT_JOB_FINISHED:
                /* handled similarly in callers; however we keep this as a hook if needed */
                break;
            default:
                break;
        }
    }

    free(event_json);
}
