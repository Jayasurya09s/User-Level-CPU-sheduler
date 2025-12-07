CC = gcc
CFLAGS = -Iinclude -Wall -Wextra -O2 -g

# Scheduler sources (exclude busy.c)
SCHED_SRC = src/main.c src/scheduler.c src/process.c src/utils.c \
           src/fcfs.c src/sjf.c src/srtf.c src/priority.c src/priority_p.c \
           src/rr.c src/mlfq.c

SCHED_OBJ = $(SCHED_SRC:.c=.o)
SCHED_OUT = scheduler

# Busy helper program (separate binary)
BUSY_SRC = src/busy.c
BUSY_OUT = busy
BUSY_OBJ = $(BUSY_SRC:.c=.o)

.PHONY: all clean run busy

all: $(SCHED_OUT) $(BUSY_OUT)

# Pattern rule for compiling C files into .o
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Link scheduler (does NOT include busy.o)
$(SCHED_OUT): $(SCHED_OBJ)
	$(CC) $(CFLAGS) $(SCHED_OBJ) -o $(SCHED_OUT)

# Build busy helper binary
$(BUSY_OUT): $(BUSY_OBJ)
	$(CC) $(CFLAGS) $(BUSY_OBJ) -o $(BUSY_OUT)

clean:
	rm -f $(SCHED_OBJ) $(BUSY_OBJ) $(SCHED_OUT) $(BUSY_OUT)

run: all
	./$(SCHED_OUT)
