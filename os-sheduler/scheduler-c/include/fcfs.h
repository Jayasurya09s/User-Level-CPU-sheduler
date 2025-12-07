#ifndef FCFS_H
#define FCFS_H

#include "scheduler.h"

/* Per-tick handler for FCFS algorithm.
 * Called after the scheduler emits the EVT_TICK event.
 */
void fcfs_tick(scheduler_t *s);

#endif // FCFS_H
