#ifndef PRIORITY_P_H
#define PRIORITY_P_H

#include "scheduler.h"

/* Per-tick handler for preemptive priority scheduling (higher priority = lower number) */
void priority_p_tick(scheduler_t *s);

#endif // PRIORITY_P_H
