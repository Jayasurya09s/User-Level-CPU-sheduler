#ifndef PROCESS_H
#define PROCESS_H

#include <sys/types.h>
#include <limits.h>

typedef enum {
    PROC_NEW,
    PROC_READY,
    PROC_RUNNING,
    PROC_WAITING,
    PROC_TERMINATED
} proc_state_t;

typedef struct process_t {
    int pid;                 // logical PID used by scheduler (user-specified)
    unsigned int arrival;    // arrival time (ticks)
    int burst;               // total CPU burst time (ticks)
    int remaining;           // remaining time (ticks)
    int priority;            // numerical priority (lower = higher priority)
    pid_t os_pid;            // actual OS PID (for real-process mode); 0 if unused
    proc_state_t state;      // current state
    int quantum_left;        // remaining quantum (for RR / MLFQ)
    int mlfq_level;          // current MLFQ level (0 = highest priority)
    unsigned int waited;     // ticks waited in ready queue (aging) — legacy field
    unsigned int start_time; // first tick when process started running (UINT_MAX if not started)
    unsigned int finish_time;// tick when process finished (UINT_MAX if not finished)

    /* New precise waiting accounting */
    unsigned int waited_total;       // total time spent waiting (sum of ready intervals)
    unsigned int last_enqueued_tick; // tick when it was last put into ready queue (UINT_MAX if not in queue)

    struct process_t *next;  // linked-list pointer for queues
} process_t;

/* Create a new process (heap-allocated). Returns NULL on failure. */
process_t *process_create(int pid, unsigned int arrival, int burst, int priority);

/* Duplicate a process (shallow copy for simulation runs). */
process_t *process_clone(const process_t *src);

/* Free process. */
void process_free(process_t *p);

#endif // PROCESS_H
