#ifndef SRTF_H
#define SRTF_H

#include "scheduler.h"

/* Per-tick handler for SRTF (preemptive SJF) */
void srtf_tick(scheduler_t *s);

#endif // SRTF_H
