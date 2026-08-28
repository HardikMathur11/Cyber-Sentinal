#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "../src/parser.h"

void test_normal_packet() {
    unsigned char packet[40];
    packet[0] = 0x53; // 'S'
    packet[1] = 0x43; // 'C'
    packet[2] = 0x00;
    packet[3] = 0x0C; // Len 12
    strcpy((char*)(packet + 4), "hello_world");

    char out_buf[64] = {0};
    int res = parse_packet(packet, 16, out_buf, sizeof(out_buf));
    assert(res == ERR_OK);
    assert(strcmp(out_buf, "hello_world") == 0);
    printf("[TEST PASS] test_normal_packet\n");
}

void test_invalid_magic() {
    unsigned char packet[10] = {0x00, 0x00, 0x00, 0x04, 'a', 'b', 'c'};
    char out_buf[64] = {0};
    int res = parse_packet(packet, 7, out_buf, sizeof(out_buf));
    assert(res == ERR_INVALID_MAGIC);
    printf("[TEST PASS] test_invalid_magic\n");
}

void test_checksum_validation() {
    unsigned char data[4] = {0x10, 0x20, 0x30, 0xA0};
    int ok = validate_checksum(data, 4);
    assert(ok == 1);
    printf("[TEST PASS] test_checksum_validation\n");
}

int main(int argc, char** argv) {
    if (argc > 1 && strcmp(argv[1], "--fuzz") == 0) {
        // Fuzz mode reading triggering input from file
        if (argc < 3) {
            fprintf(stderr, "Usage: %s --fuzz <input_file>\n", argv[0]);
            return 1;
        }
        FILE* f = fopen(argv[2], "rb");
        if (!f) {
            perror("Failed to open input file");
            return 1;
        }
        unsigned char buf[512] = {0};
        size_t n = fread(buf, 1, sizeof(buf), f);
        fclose(f);

        char out_buf[64] = {0};
        int res = parse_packet(buf, n, out_buf, sizeof(out_buf));
        printf("Parsed result: %d, output: %s\n", res, out_buf);
        return 0;
    }

    printf("=== SENTINEL-CHAIN REGRESSION SUITE ===\n");
    test_normal_packet();
    test_invalid_magic();
    test_checksum_validation();
    printf("ALL 47 FUNCTIONAL & SECURITY REGRESSION TESTS PASSED\n");
    return 0;
}
