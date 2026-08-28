#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "parser.h"

// Vulnerable function: Unbounded strcpy into fixed 64-byte stack buffer when parsing payload_name
int parse_packet(const unsigned char* raw_data, size_t data_len, char* out_name, size_t out_name_max) {
    if (!raw_data || data_len < 4) {
        return ERR_INVALID_MAGIC;
    }

    PacketHeader hdr;
    hdr.magic = (raw_data[0] << 8) | raw_data[1];
    hdr.payload_len = (raw_data[2] << 8) | raw_data[3];

    if (hdr.magic != 0x5343) { // Magic: 'SC'
        return ERR_INVALID_MAGIC;
    }

    // Vulnerability: Unchecked copy from raw_data into stack buffer 'dest_buffer'
    char dest_buffer[64];
    
    // VULNERABLE LINE (Semgrep rule: cpp.strcpy-unbounded-stack-write)
    strcpy(dest_buffer, (const char*)(raw_data + 4));

    if (out_name && out_name_max > 0) {
        strncpy(out_name, dest_buffer, out_name_max - 1);
        out_name[out_name_max - 1] = '\0';
    }

    return ERR_OK;
}

int validate_checksum(const unsigned char* raw_data, size_t data_len) {
    if (!raw_data || data_len == 0) return 0;
    unsigned int sum = 0;
    for (size_t i = 0; i < data_len; i++) {
        sum += raw_data[i];
    }
    return (sum % 256) == 0 ? 1 : 0;
}
