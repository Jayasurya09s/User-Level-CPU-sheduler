CC = gcc
CFLAGS = -Wall -Wextra -O2 -g
SRCDIR = src
BUILDDIR = build
BINDIR = bin

MAIN_SRC = $(SRCDIR)/main.c
BUSY_SRC = $(SRCDIR)/busy.c
MAIN_OBJ = $(BUILDDIR)/main.o

.PHONY: all clean dirs run

all: dirs $(BINDIR)/scheduler $(BINDIR)/busy

dirs:
	mkdir -p $(BUILDDIR) $(BINDIR)

$(MAIN_OBJ): $(MAIN_SRC)
	$(CC) $(CFLAGS) -MMD -c $< -o $@

$(BINDIR)/scheduler: $(MAIN_OBJ)
	$(CC) $(CFLAGS) $^ -o $@

$(BINDIR)/busy: $(BUSY_SRC)
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf $(BUILDDIR) $(BINDIR)

run: all
	@echo "Built. Run example:"
	@echo "./bin/scheduler fcfs \"./bin/busy 2\" \"./bin/busy 1\""
