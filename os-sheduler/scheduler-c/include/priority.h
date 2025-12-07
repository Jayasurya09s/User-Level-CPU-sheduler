#ifndef PRIORITY_H
#define PRIORITY_H

#include "scheduler.h"

/* Per-tick handler for non-preemptive Priority scheduling */
void priority_tick(scheduler_t *s);

#endif // PRIORITY_H
