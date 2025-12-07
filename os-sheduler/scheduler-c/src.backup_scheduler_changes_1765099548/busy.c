#include <stdio.h>
#include <unistd.h>

// A dummy busy program for testing real execution mode.
int main() {
    for (volatile long i = 0; i < 500000000; i++) { }
    return 0;
}
