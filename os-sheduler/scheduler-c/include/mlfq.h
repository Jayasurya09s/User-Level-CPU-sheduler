#ifndef MLFQ_H
#define MLFQ_H

#include "scheduler.h"

/* Per-tick handler for Multi-Level Feedback Queue */
void mlfq_tick(scheduler_t *s);

#endif // MLFQ_H
