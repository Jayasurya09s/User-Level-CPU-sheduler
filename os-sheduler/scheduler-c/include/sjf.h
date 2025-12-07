#ifndef SJF_H
#define SJF_H

#include "scheduler.h"

/* Per-tick handler for non-preemptive SJF */
void sjf_tick(scheduler_t *s);

#endif // SJF_H
