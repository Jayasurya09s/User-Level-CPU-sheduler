#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <seconds>\n", argv[0]);
        return 1;
    }
    int sec = atoi(argv[1]);
    double end = (double)time(NULL) + sec;
    // simple loop that sleeps 100ms each iteration but prints occasional message to stderr
    while (time(NULL) < end) {
        usleep(100000);
    }
    // print to stderr only (stdout is reserved for scheduler JSON)
    fprintf(stderr, "busy(%d) done\n", sec);
    return 0;
}
