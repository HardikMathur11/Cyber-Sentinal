export interface GraphNode {
  id: string;
  label: string;
  path: string;
  type: 'directory' | 'source' | 'header' | 'test' | 'config' | 'payload';
  category: 'core' | 'network' | 'parser' | 'security' | 'tests' | 'build';
  status: 'safe' | 'tainted' | 'vulnerable' | 'patched' | 'verified';
  loc?: number;
  functions?: string[];
  riskScore?: number; // 0-100
  description: string;
  x: number;
  y: number;
  parentId?: string;
  imports?: string[];
  exports?: string[];
  codePreview?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'hierarchy' | 'call' | 'import' | 'taint_flow' | 'test_coverage';
  isTaintPath?: boolean;
}

export interface ProjectDirectoryGraphData {
  projectName: string;
  rootPath: string;
  totalNodes: number;
  totalFiles: number;
  totalDirectories: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const DIRECTORY_GRAPH_DEMO: ProjectDirectoryGraphData = {
  projectName: 'packet-parser-demo',
  rootPath: '/workspaces/packet-parser-demo',
  totalNodes: 16,
  totalFiles: 12,
  totalDirectories: 4,
  nodes: [
    // Directories
    {
      id: 'dir-root',
      label: 'packet-parser-demo',
      path: '/',
      type: 'directory',
      category: 'core',
      status: 'safe',
      description: 'Project root repository container with CMake build system and CI harness.',
      x: 480,
      y: 50,
    },
    {
      id: 'dir-src',
      label: 'src/',
      path: '/src',
      type: 'directory',
      category: 'core',
      status: 'tainted',
      description: 'Primary source modules handling packet demuxing, parsing, and state caching.',
      x: 320,
      y: 160,
      parentId: 'dir-root'
    },
    {
      id: 'dir-include',
      label: 'include/',
      path: '/include',
      type: 'directory',
      category: 'core',
      status: 'safe',
      description: 'Public and internal C++ header definitions and structure types.',
      x: 640,
      y: 160,
      parentId: 'dir-root'
    },
    {
      id: 'dir-tests',
      label: 'tests/',
      path: '/tests',
      type: 'directory',
      category: 'tests',
      status: 'verified',
      description: 'GoogleTest unit suites and isolated PoV crash test payloads.',
      x: 840,
      y: 160,
      parentId: 'dir-root'
    },
    {
      id: 'dir-config',
      label: 'cmake/',
      path: '/cmake',
      type: 'directory',
      category: 'build',
      status: 'safe',
      description: 'LLVM sanitizer toolchain configurations and build flags.',
      x: 120,
      y: 160,
      parentId: 'dir-root'
    },

    // Source Files in src/
    {
      id: 'file-main',
      label: 'main.cpp',
      path: '/src/main.cpp',
      type: 'source',
      category: 'core',
      status: 'safe',
      loc: 85,
      functions: ['main()', 'init_daemon()', 'signal_handler()'],
      riskScore: 10,
      description: 'Daemon bootstrap and main event loop dispatcher.',
      x: 180,
      y: 280,
      parentId: 'dir-src',
      imports: ['network.h', 'parser.h'],
      codePreview: `// main.cpp - Packet Parser System Bootstrap
#include <iostream>
#include <csignal>
#include "network.h"
#include "parser.h"

static volatile bool g_running = true;

void signal_handler(int signum) {
    std::cout << "\\n[!] Interrupted by signal " << signum << ", shutting down gracefully..." << std::endl;
    g_running = false;
}

int init_daemon(int port) {
    std::cout << "[*] Starting Sentinel-Chain Cyber-Defense Node on port " << port << std::endl;
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);
    return 0;
}

int main(int argc, char** argv) {
    int port = (argc > 1) ? std::atoi(argv[1]) : 8080;
    if (init_daemon(port) != 0) {
        std::cerr << "[-] Daemon initialization failed" << std::endl;
        return 1;
    }
    
    std::cout << "[+] Listening for untrusted ingress packets..." << std::endl;
    NetworkSocket sock(port);
    while (g_running) {
        sock.listen_and_dispatch();
    }
    std::cout << "[*] System stopped cleanly." << std::endl;
    return 0;
}`
    },
    {
      id: 'file-network',
      label: 'network.cpp',
      path: '/src/network.cpp',
      type: 'source',
      category: 'network',
      status: 'tainted',
      loc: 184,
      functions: ['listen_and_dispatch()', 'handle_client_stream()', 'read_raw_frame()'],
      riskScore: 65,
      description: 'Raw TCP socket listener receiving untrusted external network packet frames.',
      x: 320,
      y: 280,
      parentId: 'dir-src',
      imports: ['network.h', 'types.h', 'parser.h'],
      codePreview: `// network.cpp - Raw TCP Socket Demultiplexer
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <iostream>
#include "network.h"
#include "parser.h"

NetworkSocket::NetworkSocket(int port) : server_port(port), server_fd(-1) {}

void NetworkSocket::handle_client_stream(int client_fd) {
    char raw_buf[4096];
    ssize_t bytes_read = read(client_fd, raw_buf, sizeof(raw_buf));
    
    if (bytes_read > 0) {
        std::cout << "[*] Received raw packet frame: " << bytes_read << " bytes" << std::endl;
        // TAINT VECTOR: Untrusted ingress payload passed straight into deep parser
        PacketParser parser;
        parser.parse_packet(raw_buf, bytes_read);
    } else if (bytes_read < 0) {
        std::cerr << "[-] Error reading from client socket " << client_fd << std::endl;
    }
    close(client_fd);
}

void NetworkSocket::listen_and_dispatch() {
    // Poll loop dispatching connections to parser workers
    int dummy_client = 3;
    handle_client_stream(dummy_client);
}`
    },
    {
      id: 'file-parser',
      label: 'parser.cpp',
      path: '/src/parser.cpp',
      type: 'source',
      category: 'parser',
      status: 'vulnerable',
      loc: 312,
      functions: ['parse_packet()', 'extract_header()', 'decode_payload()', 'validate_checksum()'],
      riskScore: 98,
      description: 'HIGH RISK: Unchecked strcpy in extract_header() triggers stack-buffer-overflow (CWE-121).',
      x: 480,
      y: 280,
      parentId: 'dir-src',
      imports: ['parser.h', 'buffer_utils.h', 'types.h'],
      codePreview: `// parser.cpp - Vulnerable Packet De-serialization Engine
#include <cstring>
#include <iostream>
#include "parser.h"
#include "buffer_utils.h"

int PacketParser::extract_header(const char* packet_data, size_t len) {
    // Fixed stack buffer allocation
    char stack_dest[64];
    
    // ============================================================
    // VULNERABILITY DETECTED [CWE-121]: Stack-based Buffer Overflow
    // Taint sink: packet_data offset 12 is copied without length validation.
    // If packet_data payload exceeds 63 bytes, it overwrites the stack frame return address.
    // ============================================================
    strcpy(stack_dest, packet_data + 12);
    
    std::cout << "[+] Parsed header tag: " << stack_dest << std::endl;
    return 0;
}

int PacketParser::parse_packet(const char* data, size_t len) {
    if (len < 16) {
        std::cerr << "[-] Malformed packet: insufficient length" << std::endl;
        return -1;
    }
    
    // Check magic signature
    if (std::memcmp(data, "PKT\\x01", 4) != 0) {
        std::cerr << "[-] Invalid packet magic header" << std::endl;
        return -2;
    }
    
    return extract_header(data, len);
}`
    },
    {
      id: 'file-buffer-utils',
      label: 'buffer_utils.cpp',
      path: '/src/buffer_utils.cpp',
      type: 'source',
      category: 'security',
      status: 'patched',
      loc: 98,
      functions: ['safe_memcpy()', 'hex_dump()', 'validate_bounds()'],
      riskScore: 25,
      description: 'Memory safety boundary primitives and patch invariant enforcement helpers.',
      x: 320,
      y: 400,
      parentId: 'dir-src',
      imports: ['buffer_utils.h', 'types.h'],
      codePreview: `// buffer_utils.cpp - Certified Bounds-Checked Memory Utilities
#include <cstring>
#include <iostream>
#include "buffer_utils.h"

bool safe_bounded_copy(char* dest, size_t dest_size, const char* src, size_t src_len) {
    if (dest == nullptr || src == nullptr || dest_size == 0) {
        return false;
    }
    
    // Formal Invariant Check: guarantee src fits inside dest
    if (src_len >= dest_size) {
        std::cerr << "[!] Bounds violation prevented: " << src_len << " >= " << dest_size << std::endl;
        return false;
    }
    
    std::memcpy(dest, src, src_len);
    dest[src_len] = '\\0';
    return true;
}`
    },
    {
      id: 'file-protocol',
      label: 'protocol.cpp',
      path: '/src/protocol.cpp',
      type: 'source',
      category: 'core',
      status: 'safe',
      loc: 164,
      functions: ['serialize_frame()', 'deserialize_frame()', 'compute_crc32()'],
      riskScore: 15,
      description: 'Packet wire encoding and serialization format specifications.',
      x: 180,
      y: 400,
      parentId: 'dir-src',
      imports: ['types.h'],
      codePreview: `// protocol.cpp - Network Wire Format CRC & Checksum Routines
#include <cstdint>
#include <cstddef>
#include "types.h"

uint32_t compute_crc32(const uint8_t* data, size_t length) {
    static const uint32_t crc_table[16] = {
        0x00000000, 0x1DB71064, 0x3B6E20C8, 0x26D930AC,
        0x76DC4190, 0x6B6B51F4, 0x4DB26158, 0x5005713C,
        0xEDB88320, 0xF00F9344, 0xD6D6A3E8, 0xCB61B38C,
        0x9B64C2B0, 0x86D3D2D4, 0xA00AE278, 0xBDBDF21C
    };
    
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; ++i) {
        crc = (crc >> 4) ^ crc_table[(crc ^ (data[i] & 0x0F)) & 0x0F];
        crc = (crc >> 4) ^ crc_table[(crc ^ (data[i] >> 4)) & 0x0F];
    }
    return ~crc;
}`
    },

    // Headers in include/
    {
      id: 'header-network',
      label: 'network.h',
      path: '/include/network.h',
      type: 'header',
      category: 'network',
      status: 'safe',
      loc: 42,
      description: 'Network socket interface definitions and client session structures.',
      x: 640,
      y: 280,
      parentId: 'dir-include'
    },
    {
      id: 'header-parser',
      label: 'parser.h',
      path: '/include/parser.h',
      type: 'header',
      category: 'parser',
      status: 'vulnerable',
      loc: 56,
      description: 'Parser class API interface and internal header signature declarations.',
      x: 760,
      y: 280,
      parentId: 'dir-include'
    },
    {
      id: 'header-types',
      label: 'types.h',
      path: '/include/types.h',
      type: 'header',
      category: 'core',
      status: 'safe',
      loc: 88,
      description: 'Global packet enum codes, error constants, and memory buffer descriptors.',
      x: 640,
      y: 400,
      parentId: 'dir-include'
    },

    // Test Files in tests/
    {
      id: 'file-test-parser',
      label: 'test_parser.cpp',
      path: '/tests/test_parser.cpp',
      type: 'test',
      category: 'tests',
      status: 'verified',
      loc: 210,
      functions: ['TEST(ParserTest, ValidFrame)', 'TEST(ParserTest, OverflowMitigation)'],
      riskScore: 0,
      description: 'GoogleTest functional regression suite (47 / 47 passing).',
      x: 840,
      y: 280,
      parentId: 'dir-tests',
      imports: ['parser.h', 'types.h']
    },
    {
      id: 'file-pov-payload',
      label: 'pov_crash_001.bin',
      path: '/tests/pov_crash_001.bin',
      type: 'payload',
      category: 'tests',
      status: 'vulnerable',
      loc: 1,
      riskScore: 100,
      description: 'Deterministic 128-byte raw Proof-of-Vulnerability trigger payload.',
      x: 840,
      y: 400,
      parentId: 'dir-tests'
    },

    // Build files
    {
      id: 'file-cmake',
      label: 'CMakeLists.txt',
      path: '/CMakeLists.txt',
      type: 'config',
      category: 'build',
      status: 'safe',
      loc: 65,
      description: 'Primary CMake build manifest linking GoogleTest, pthread, and ASan.',
      x: 120,
      y: 280,
      parentId: 'dir-config'
    }
  ],
  edges: [
    // Hierarchy edges (Root -> Folders)
    { id: 'e-root-src', source: 'dir-root', target: 'dir-src', type: 'hierarchy' },
    { id: 'e-root-include', source: 'dir-root', target: 'dir-include', type: 'hierarchy' },
    { id: 'e-root-tests', source: 'dir-root', target: 'dir-tests', type: 'hierarchy' },
    { id: 'e-root-config', source: 'dir-root', target: 'dir-config', type: 'hierarchy' },

    // Folder -> Files
    { id: 'e-src-main', source: 'dir-src', target: 'file-main', type: 'hierarchy' },
    { id: 'e-src-network', source: 'dir-src', target: 'file-network', type: 'hierarchy' },
    { id: 'e-src-parser', source: 'dir-src', target: 'file-parser', type: 'hierarchy' },
    { id: 'e-src-buffer', source: 'dir-src', target: 'file-buffer-utils', type: 'hierarchy' },
    { id: 'e-src-protocol', source: 'dir-src', target: 'file-protocol', type: 'hierarchy' },
    { id: 'e-inc-net', source: 'dir-include', target: 'header-network', type: 'hierarchy' },
    { id: 'e-inc-parser', source: 'dir-include', target: 'header-parser', type: 'hierarchy' },
    { id: 'e-inc-types', source: 'dir-include', target: 'header-types', type: 'hierarchy' },
    { id: 'e-tests-unit', source: 'dir-tests', target: 'file-test-parser', type: 'hierarchy' },
    { id: 'e-tests-pov', source: 'dir-tests', target: 'file-pov-payload', type: 'hierarchy' },
    { id: 'e-cfg-cmake', source: 'dir-config', target: 'file-cmake', type: 'hierarchy' },

    // CALL & TAINT FLOW EDGES (Critical Attack Path)
    {
      id: 'taint-1',
      source: 'file-network',
      target: 'file-parser',
      label: 'Tainted Data Flow (raw_buf -> parse_packet)',
      type: 'taint_flow',
      isTaintPath: true
    },
    {
      id: 'taint-2',
      source: 'file-parser',
      target: 'file-buffer-utils',
      label: 'Remediated Invariant Guard Call',
      type: 'call',
      isTaintPath: false
    },
    {
      id: 'test-coverage-1',
      source: 'file-test-parser',
      target: 'file-parser',
      label: 'GoogleTest Assertions',
      type: 'test_coverage',
      isTaintPath: false
    },
    {
      id: 'test-pov-flow',
      source: 'file-pov-payload',
      target: 'file-parser',
      label: 'PoV Crash Reproduction Payload',
      type: 'taint_flow',
      isTaintPath: true
    }
  ]
};
