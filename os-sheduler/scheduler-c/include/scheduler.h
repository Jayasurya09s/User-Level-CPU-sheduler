#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "process.h"

typedef enum {
    ALG_NONE,
    ALG_FCFS,
    ALG_SJF,
    ALG_SRTF,
    ALG_PRIORITY,
    ALG_PRIORITY_P,
    ALG_RR,
    ALG_MLFQ
} sched_algo_t;

typedef enum {
    EVT_TICK,
    EVT_JOB_STARTED,
    EVT_JOB_PREEMPTED,
    EVT_JOB_RESUMED,
    EVT_JOB_FINISHED,
    EVT_CONTEXT_SWITCH,
    EVT_GANTT_SLICE
} event_type_t;

/* Simple completed-process summary stored by the scheduler for metrics. */
typedef struct {
    int pid;
    unsigned int arrival;
    int burst;
    unsigned int start_time;
    unsigned int finish_time;
    int priority;
} completed_proc_t;

typedef struct scheduler_t {
    sched_algo_t algo;
    unsigned long current_tick;
    unsigned long quantum;
    process_t *ready_head;
    process_t *running;

    /* metrics/summary */
    unsigned long context_switches;
    completed_proc_t *completed;
    size_t completed_count;
    size_t completed_capacity;
} scheduler_t;

/* lifecycle */
scheduler_t *scheduler_create(sched_algo_t algo);
void scheduler_destroy(scheduler_t *s);

/* operations */
void scheduler_add_process(scheduler_t *s, process_t *p);
process_t *scheduler_remove_process(scheduler_t *s, int pid);
/* pop the ready queue head and return it (NULL if empty).
 * This updates the process's waited_total using scheduler current tick.
 */
process_t *scheduler_pop_head(scheduler_t *s);

void scheduler_tick(scheduler_t *s);

/* add a completed process snapshot */
void scheduler_record_completed(scheduler_t *s, const process_t *p);

#endif // SCHEDULER_H
