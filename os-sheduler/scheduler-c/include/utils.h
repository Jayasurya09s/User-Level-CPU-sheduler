#ifndef UTILS_H
#define UTILS_H

#include "scheduler.h"
#include "process.h"

/* Build an event JSON string (heap-allocated) */
char *utils_build_event(event_type_t type, const scheduler_t *sched, const process_t *proc, const char *event_info);

/* Emit the given JSON event string, update scheduler metrics based on event type, then free the string.
 * IMPORTANT: Provide the event_type and scheduler pointer so metrics can update (e.g., count context switches).
 */
void utils_emit_event_and_free(char *event_json, event_type_t type, scheduler_t *sched);

#endif // UTILS_H
