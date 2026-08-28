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
      codePreview: `int main(int argc, char** argv) {\n    std::cout << "[*] Initializing Packet Parser Daemon v1.4..." << std::endl;\n    NetworkSocket sock(8080);\n    sock.listen_and_dispatch();\n    return 0;\n}`
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
      codePreview: `void NetworkSocket::handle_client_stream(int client_fd) {\n    char raw_buf[4096];\n    ssize_t bytes_read = read(client_fd, raw_buf, sizeof(raw_buf));\n    if (bytes_read > 0) {\n        // Tainted ingress: Passing raw payload to parser without bounds validation\n        PacketParser::parse_packet(raw_buf, bytes_read);\n    }\n}`
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
      codePreview: `int PacketParser::extract_header(const char* packet_data, size_t len) {\n    char stack_dest[64]; // Fixed stack buffer\n    // VULNERABILITY: Unbounded copy directly onto stack frame\n    strcpy(stack_dest, packet_data + 12);\n    return 0;\n}`
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
      codePreview: `bool safe_bounded_copy(char* dest, size_t dest_size, const char* src, size_t src_len) {\n    if (src_len >= dest_size) {\n        return false; // Bounds safety invariant enforced\n    }\n    memcpy(dest, src, src_len);\n    dest[src_len] = '\\0';\n    return true;\n}`
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
      codePreview: `uint32_t compute_crc32(const uint8_t* data, size_t length) {\n    uint32_t crc = 0xFFFFFFFF;\n    for (size_t i = 0; i < length; ++i) {\n        crc = (crc >> 8) ^ crc_table[(crc ^ data[i]) & 0xFF];\n    }\n    return ~crc;\n}`
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
