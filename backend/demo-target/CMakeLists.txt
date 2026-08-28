cmake_minimum_required(VERSION 3.10)
project(SentinelDemoTarget C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

include_directories(src)

add_library(sentinel_parser STATIC src/parser.cpp)

add_executable(test_runner tests/test_runner.cpp)
target_link_libraries(test_runner PRIVATE sentinel_parser)
