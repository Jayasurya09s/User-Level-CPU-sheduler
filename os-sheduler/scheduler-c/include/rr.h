#ifndef RR_H
#define RR_H

#include "scheduler.h"

/* Per-tick handler for Round Robin. Uses scheduler->quantum as time slice. */
void rr_tick(scheduler_t *s);

#endif // RR_H
