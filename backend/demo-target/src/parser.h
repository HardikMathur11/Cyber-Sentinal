#ifndef SENTINEL_PARSER_H
#define SENTINEL_PARSER_H

#include <stddef.h>

#define ERR_OK 0
#define ERR_INVALID_MAGIC -1
#define ERR_BUFFER_OVERFLOW -2
#define ERR_PAYLOAD_TOO_LARGE -3

typedef struct {
    unsigned short magic;
    unsigned short payload_len;
    char payload_name[32];
} PacketHeader;

#ifdef __cplusplus
extern "C" {
#endif

int parse_packet(const unsigned char* raw_data, size_t data_len, char* out_name, size_t out_name_max);
int validate_checksum(const unsigned char* raw_data, size_t data_len);
int run_regression_tests(void);

#ifdef __cplusplus
}
#endif

#endif // SENTINEL_PARSER_H
