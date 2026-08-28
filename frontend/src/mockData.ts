import {
  SecurityRun,
  PipelineStage,
  AgentInfo,
  ProjectProfile,
  Finding,
  ProofOfVulnerability,
  PatchAttempt,
  VerificationResult,
  BreakMyPatchData,
  RegressionResult,
  PerformanceResult,
  ProofCertificate,
  TimelineEvent,
  ConsoleLogMessage
} from './types';

export const INITIAL_STAGES: PipelineStage[] = [
  { id: 'upload', name: 'Source Upload', shortName: 'UPLOAD', status: 'success', description: 'Source code intake, AST parsing, language and build configuration discovery', agentResponsible: 'Recon Agent', outputSummary: 'C++ CMake Project Detected' },
  { id: 'recon', name: 'Recon & Metadata', shortName: 'RECON', status: 'success', description: 'Symbol table resolution, dependency vulnerability audit, target inventory', agentResponsible: 'Recon Agent', outputSummary: '18 files, 74 functions resolved' },
  { id: 'attack_surface', name: 'Attack Surface Mapping', shortName: 'ATTACK SURFACE', status: 'success', description: 'External I/O ingestion point identification, network parser attack vectors', agentResponsible: 'Attack Surface Agent', outputSummary: '3 network ingress entry points' },
  { id: 'static_analysis', name: 'Static Code Analysis', shortName: 'STATIC ANALYSIS', status: 'success', description: 'Semgrep rule AST traversal, Clang-Tidy checks, tainted data flow tracing', agentResponsible: 'Static Analysis Agent', outputSummary: 'High-risk memory write found at parser.cpp:142' },
  { id: 'fuzzing', name: 'Guided Dynamic Fuzzing', shortName: 'FUZZING', status: 'success', description: 'LibFuzzer + AddressSanitizer instrumented crash exploration', agentResponsible: 'Fuzzing Agent', outputSummary: 'Crash triggered after 4,812 executions' },
  { id: 'pov', name: 'Proof of Vulnerability', shortName: 'POV CONFIRMED', status: 'success', description: 'Deterministic trigger input extraction and ASan stack-buffer-overflow verification', agentResponsible: 'Exploit Validation Agent', outputSummary: '10/10 deterministic crash reproduction' },
  { id: 'patch', name: 'Remediation Synthesis', shortName: 'PATCH', status: 'success', description: 'Autonomous minimal patch synthesis with formal security property invariants', agentResponsible: 'Patch Agent', outputSummary: 'Patch v2 synthesized (bounds-checking)' },
  { id: 'verify', name: 'Isolated Verification', shortName: 'VERIFY', status: 'success', description: 'Zero-bias independent verification sandbox without Patch Agent hallucinations', agentResponsible: 'Verification Agent', outputSummary: 'VERIFICATION PASS (96% confidence)' },
  { id: 'break_my_patch', name: 'Adversarial Break My Patch', shortName: 'BREAK MY PATCH', status: 'success', description: '1,250 fuzzing mutations & boundary attack payloads targeted at patch logic', agentResponsible: 'Break My Patch Agent', outputSummary: '1,247 blocked / 0 exploits' },
  { id: 'regression', name: 'Functional Regression', shortName: 'REGRESSION', status: 'success', description: 'GoogleTest test suite validation to guarantee no functional breakage', agentResponsible: 'Regression Agent', outputSummary: '47 / 47 test cases passing' },
  { id: 'performance', name: 'Performance Profiling', shortName: 'PERFORMANCE', status: 'success', description: 'Throughput and latency overhead benchmark evaluation', agentResponsible: 'Performance Agent', outputSummary: 'Baseline: 12.4ms vs Patched: 12.7ms (+2.4%)' },
  { id: 'certificate', name: 'Proof Certification', shortName: 'CERTIFICATE', status: 'success', description: 'Cryptographic SHA-256 remediation proof certificate and audit ledger', agentResponsible: 'Proof Agent', outputSummary: 'Certificate SC-2026-001847 issued' }
];

export const INITIAL_AGENTS: AgentInfo[] = [
  {
    id: 'recon-agent',
    name: 'Recon Agent',
    role: 'Language, build system, and architecture discovery',
    status: 'COMPLETED',
    provider: 'Grok-3 Cyber / Gemini-3.7-Flash',
    tools: ['Tree-sitter AST', 'Clang AST Explorer', 'CMake Parser', 'Package Graph'],
    currentTask: 'Indexed 18 source files & 74 exported symbols',
    progressPercent: 100,
    activeFile: 'CMakeLists.txt',
    iconName: 'Compass',
    summary: 'Analyzed repository structure, verified C++20 standard, identified CMake build targets.'
  },
  {
    id: 'attack-surface-agent',
    name: 'Attack Surface Agent',
    role: 'Identify untrusted data intake and public entry points',
    status: 'COMPLETED',
    provider: 'Grok-3 Cyber / Gemini-3.7-Flash',
    tools: ['Call Graph Builder', 'Taint Tracker', 'API Ingress Scanner'],
    currentTask: 'Mapped untrusted packet ingestion to `parse_packet()`',
    progressPercent: 100,
    activeFile: 'src/network.cpp',
    iconName: 'ShieldAlert',
    summary: 'Traced raw byte buffer flow from socket descriptor directly to string manipulation utility.'
  },
  {
    id: 'threat-analysis-agent',
    name: 'Threat Analysis Agent',
    role: 'Model potential attacker objectives and exploit paths',
    status: 'COMPLETED',
    provider: 'Grok-3 Cyber / Gemini-3.7-Flash',
    tools: ['STRIDE Engine', 'CWE Correlation', 'CAPEC Database'],
    currentTask: 'Classified impact: Stack Corruption & Remote Denial of Service',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'Flame',
    summary: 'Assigned CVSS 8.8 (High) - Remote code execution / denial of service via memory smash.'
  },
  {
    id: 'static-analysis-agent',
    name: 'Static Analysis Agent',
    role: 'Execute deterministic AST patterns and tainted data flow rules',
    status: 'COMPLETED',
    provider: 'Deterministic Semgrep + Clang-Tidy',
    tools: ['Semgrep Security Rules', 'Clang-Tidy Analyzer', 'Cppcheck Engine'],
    currentTask: 'Flagged unsafe `strcpy(buffer, input)` at parser.cpp:142',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'Search',
    summary: 'Identified unbounded memory copy into 64-byte stack array without prior size validation.'
  },
  {
    id: 'fuzzing-agent',
    name: 'Fuzzing Agent',
    role: 'Guided evolutionary fuzz testing with ASan/UBSan',
    status: 'COMPLETED',
    provider: 'LibFuzzer + Honggfuzz + LLVM',
    tools: ['LibFuzzer', 'AddressSanitizer', 'Coverage Guided Engine'],
    currentTask: 'Explored 4,812 executions; triggered SEGV at len=128',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'Cpu',
    summary: 'Synthesized seed corpus leading to immediate deterministic AddressSanitizer stack overflow.'
  },
  {
    id: 'exploit-validation-agent',
    name: 'Exploit Validation Agent',
    role: 'Synthesize minimal reproducible Proof of Vulnerability (PoV)',
    status: 'COMPLETED',
    provider: 'Grok-3 Cyber / Gemini-3.7-Flash',
    tools: ['PoV Builder', 'Core Dump Analyzer', 'GDB Machine Interface'],
    currentTask: 'Extracted standalone `pov_crash_001.bin` test payload',
    progressPercent: 100,
    activeFile: 'tests/pov_crash_001.bin',
    iconName: 'CheckCircle2',
    summary: 'Confirmed 10/10 deterministic crash reproduction across multiple isolated executions.'
  },
  {
    id: 'patch-agent',
    name: 'Patch Agent',
    role: 'Generate minimal, mathematically sound, verified patches',
    status: 'COMPLETED',
    provider: 'Grok-3 Cyber / Gemini-3.7-Flash',
    tools: ['Code Synthesizer', 'Diff Engine', 'Formal Property Prover'],
    currentTask: 'Synthesized Patch #2 with strict length invariant check',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'Wrench',
    summary: 'Replaced unchecked `strcpy` with boundary guard returning `ERR_INPUT_TOO_LONG`.'
  },
  {
    id: 'verification-agent',
    name: 'Verification Agent',
    role: 'Independent isolated judge (zero trust in Patch Agent)',
    status: 'COMPLETED',
    provider: 'Independent Isolated LLM + Clang Toolchain',
    tools: ['Sandbox Rebuilder', 'PoV Re-executor', 'Memory Sanitizer'],
    currentTask: 'Re-tested original PoV: Result = BLOCKED (Return Code 4)',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'ShieldCheck',
    summary: 'Verified that the original exploit payload no longer causes memory corruption or sanitizer violations.'
  },
  {
    id: 'break-my-patch-agent',
    name: 'Break My Patch Agent',
    role: 'Adversarially attack the candidate patch with mutational fuzzing',
    status: 'COMPLETED',
    provider: 'Adversarial Mutation Engine',
    tools: ['Mutation Fuzzer', 'Boundary Stressor', 'Unicode / Truncation Injector'],
    currentTask: 'Executed 1,250 adversarial test cases (0 exploits)',
    progressPercent: 100,
    activeFile: 'src/parser.cpp',
    iconName: 'Zap',
    summary: 'Stress tested off-by-one, null byte injection, integer overflow sizes, and negative offsets.'
  },
  {
    id: 'regression-agent',
    name: 'Regression Agent',
    role: 'Verify that benign functional features remain intact',
    status: 'COMPLETED',
    provider: 'GoogleTest Runner',
    tools: ['GoogleTest Runner', 'Valgrind Memcheck', 'API Contract Validator'],
    currentTask: 'Executed 47 test suites across parser, network, and utils',
    progressPercent: 100,
    activeFile: 'tests/test_parser.cpp',
    iconName: 'GitPullRequest',
    summary: '47 of 47 regression tests succeeded. Zero broken valid user inputs.'
  },
  {
    id: 'performance-agent',
    name: 'Performance Agent',
    role: 'Profile runtime execution time and memory footprint overhead',
    status: 'COMPLETED',
    provider: 'Google Benchmark / perf',
    tools: ['Linux perf', 'Google Benchmark', 'FlameGraph Generator'],
    currentTask: 'Measured +2.4% latency overhead (within SLA of <5%)',
    progressPercent: 100,
    activeFile: 'benchmarks/perf_bench.cpp',
    iconName: 'Activity',
    summary: '12.4ms baseline vs 12.7ms patched. Memory consumption stable at 18.2 MB.'
  },
  {
    id: 'proof-agent',
    name: 'Proof Agent',
    role: 'Mint cryptographic SHA-256 remediation proof certificate',
    status: 'COMPLETED',
    provider: 'Deterministic Cryptographic Seal',
    tools: ['SHA-256 Hasher', 'Ed25519 Signer', 'Audit Ledger Minter'],
    currentTask: 'Minted Certificate SC-2026-001847',
    progressPercent: 100,
    activeFile: 'certificates/SC-2026-001847.json',
    iconName: 'Award',
    summary: 'Cryptographically sealed audit trail linking AST findings, PoV input, patch diff, and verification hash.'
  }
];

export const DEMO_PROJECT_PROFILE: ProjectProfile = {
  name: 'packet-parser-demo',
  language: 'C++',
  framework: 'Asynchronous Networking Daemon',
  buildSystem: 'CMake 3.28',
  fileCount: 18,
  functionCount: 74,
  dependencyCount: 6,
  testFramework: 'GoogleTest 1.14',
  supportedAnalysis: [
    'Static AST Analysis (Semgrep)',
    'AddressSanitizer (ASan)',
    'UndefinedBehaviorSanitizer (UBSan)',
    'Evolutionary Fuzzing (LibFuzzer)',
    'GoogleTest Regression Suite',
    'High-Precision Latency Profiling'
  ],
  entryPoints: [
    'src/main.cpp:52 -> main()',
    'src/network.cpp:118 -> handle_incoming_connection()',
    'src/parser.cpp:88 -> parse_network_packet()'
  ],
  linesOfCode: 3420
};

export const DEMO_FINDINGS: Finding[] = [
  {
    id: 'VULN-001',
    severity: 'HIGH',
    confidence: 94,
    type: 'Stack Buffer Overflow',
    cwe: 'CWE-121',
    cvss: 8.8,
    file: 'src/parser.cpp',
    line: 142,
    col: 5,
    functionName: 'parse_header_tag(const char* input)',
    status: 'CONFIRMED',
    summary: 'Unsafe string copy into fixed 64-byte stack allocation without bounds checking.',
    description: 'The function `parse_header_tag` allocates a stack array `char buffer[64]` and invokes `strcpy(buffer, input)`. When an attacker sends a network packet with a header tag exceeding 63 bytes, memory corruption occurs, smashing the function return address and causing an AddressSanitizer crash.',
    vulnerableSnippet: `// Vulnerable function in src/parser.cpp:138-146\nint parse_header_tag(const char* input) {\n    char buffer[64];\n    // [CRITICAL ERROR]: Unchecked copy of untrusted payload\n    strcpy(buffer, input);\n    \n    return process_tag_internal(buffer);\n}`,
    attackPath: [
      'USER INPUT (Raw TCP Socket 0.0.0.0:8080)',
      'PACKET PARSER (handle_incoming_connection)',
      'UNSAFE COPY (strcpy to 64-byte stack buffer)',
      'BUFFER OVERFLOW (Stack return pointer smashed)',
      'PROGRAM CRASH (AddressSanitizer SIGSEGV detected)'
    ],
    staticEvidence: 'Semgrep rule `cpp.lang.security.insecure-use-strcpy`: Unbounded destination buffer write. No `strlen()` validation found before line 142.',
    runtimeEvidence: 'AddressSanitizer: DEADLYSIGNAL stack-buffer-overflow on address 0x7fff5fbff7c0 at pc 0x000104a3e218 bp 0x7fff5fbff780 sp 0x7fff5fbff778. Crash reproduced 10/10 times with pov_crash_001.bin.',
    reproductionCount: '10 / 10',
    triggerInputFilename: 'pov_crash_001.bin'
  },
  {
    id: 'VULN-002',
    severity: 'MEDIUM',
    confidence: 82,
    type: 'Unsafe Input Validation',
    cwe: 'CWE-20',
    cvss: 5.3,
    file: 'src/network.cpp',
    line: 87,
    col: 9,
    functionName: 'validate_packet_length(uint32_t len)',
    status: 'INVESTIGATING',
    summary: 'Integer truncation risk in socket frame length calculation.',
    description: 'Header packet length is parsed as a 32-bit unsigned integer but cast to signed short in downstream sub-handler, risking negative index wrapping under large packet payloads.',
    vulnerableSnippet: `// In src/network.cpp:85-92\nint read_frame_payload(int sock, uint32_t raw_len) {\n    short frame_size = (short)raw_len; // Potential truncation\n    if (frame_size > MAX_FRAME) return -1;\n    return read_bytes(sock, frame_size);\n}`,
    attackPath: [
      'TCP PACKET WITH LEN 0x00010020',
      'INT TRUNCATION TO 0x0020 (32 bytes)',
      'INCORRECT BUFFER SIZING',
      'POTENTIAL HEAP DESYNC'
    ],
    staticEvidence: 'Clang-Tidy warning `bugprone-narrowing-conversions`: narrowing conversion from uint32_t to short.',
    runtimeEvidence: 'Fuzzing agent generated 24 payload permutations; awaiting automated verification of secondary patch.',
    reproductionCount: '8 / 10',
    triggerInputFilename: 'pov_trunc_002.bin'
  }
];

export const DEMO_POV: ProofOfVulnerability = {
  target: 'packet_parser::parse_header_tag',
  vulnerability: 'Stack Buffer Overflow (CWE-121)',
  reproductionRate: '10 / 10',
  crashDetails: 'AddressSanitizer detected stack-buffer-overflow in thread T0 at pc 0x55d8e92f1b4a. Frame #0 strcpy() smashed frame #1 parse_header_tag() return address.',
  triggerInputName: 'pov_crash_001.bin',
  triggerInputHex: '48 45 41 44 45 52 3a 20 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 42 42 42 42 43 43 43 43 44 44 44 44 00',
  triggerInputAscii: 'HEADER: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBCCCCDDDD\\x00',
  sanitizerLog: `=================================================================
==4812==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffd5e0a6d00 at pc 0x7f83b1a20e40 bp 0x7ffd5e0a6c90 sp 0x7ffd5e0a6440
WRITE of size 77 at 0x7ffd5e0a6d00 thread T0
    #0 0x7f83b1a20e3f in __interceptor_strcpy /build/gcc/src/gcc/libsanitizer/asan/asan_interceptors.cpp:425
    #1 0x55d8e92f1b49 in parse_header_tag(char const*) src/parser.cpp:142:5
    #2 0x55d8e92f1dda in parse_network_packet(PacketStruct*) src/parser.cpp:94:12
    #3 0x55d8e92f2510 in handle_incoming_connection(int) src/network.cpp:124:9
    #4 0x55d8e92f2890 in main src/main.cpp:64:5
    #5 0x7f83b1600d8f in __libc_start_call_main ../sysdeps/nptl/libc_start_call_main.h:58
    #6 0x7f83b1600e3f in __libc_start_main_impl ../csu/libc-start.c:392

Address 0x7ffd5e0a6d00 is located in stack of thread T0 at offset 64 in frame
    #0 0x55d8e92f1aa0 in parse_header_tag(char const*) src/parser.cpp:138

  This frame has 1 object(s):
    [32, 96) 'buffer' <== Memory access at offset 64 overflows this variable
HINT: this may be a false positive if your program uses some custom stack unwind mechanism
SUMMARY: AddressSanitizer: stack-buffer-overflow src/parser.cpp:142:5 in parse_header_tag
=================================================================`,
  evidenceItems: [
    { title: 'Static Finding Confirmed', description: 'Semgrep AST pattern identified unchecked strcpy into 64-byte destination buffer.', verified: true },
    { title: 'Runtime Crash Replicated', description: 'AddressSanitizer caught SIGSEGV memory corruption at memory offset +64.', verified: true },
    { title: 'Sanitizer Evidence Logged', description: 'Stack unwind trace confirms exact instruction pointer address and frame boundary smash.', verified: true },
    { title: 'Deterministic Reproducible Input', description: 'Extracted standalone binary trigger payload (77 bytes) reproduces crash with 100% fidelity.', verified: true }
  ]
};

export const DEMO_PATCH_ATTEMPTS: PatchAttempt[] = [
  {
    attemptNumber: 1,
    patchId: 'PATCH-ATTEMPT-01',
    status: 'FAILED_VERIFICATION',
    author: 'Patch Agent (Candidate #1)',
    filesChanged: 1,
    linesAdded: 3,
    linesRemoved: 1,
    buildStatus: 'SUCCESS',
    securityProperty: 'Naive truncation via strncpy without null termination guarantee',
    vulnerableCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    strcpy(buffer, input);\n    return process_tag_internal(buffer);\n}`,
    patchedCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    // Naive patch attempt #1\n    strncpy(buffer, input, sizeof(buffer));\n    return process_tag_internal(buffer);\n}`,
    diffText: `--- a/src/parser.cpp\n+++ b/src/parser.cpp\n@@ -140,3 +140,4 @@\n     char buffer[64];\n-    strcpy(buffer, input);\n+    // Naive patch attempt #1\n+    strncpy(buffer, input, sizeof(buffer));\n     return process_tag_internal(buffer);`,
    verificationReason: 'REJECTED by Verification Agent: When input length >= 64, strncpy does NOT null-terminate buffer, causing subsequent string reads in process_tag_internal() to trigger an out-of-bounds read error.',
    compilerLogs: 'CMake Build: Succeeded with 0 errors. Clang-Tidy: Warning - strncpy may leave buffer unterminated.'
  },
  {
    attemptNumber: 2,
    patchId: 'PATCH-ATTEMPT-02',
    status: 'VERIFIED',
    author: 'Patch Agent (Candidate #2 - Bounds Enforced)',
    filesChanged: 1,
    linesAdded: 8,
    linesRemoved: 2,
    buildStatus: 'SUCCESS',
    securityProperty: 'Explicit length pre-validation with safe bounded copy and mandatory null termination invariant',
    vulnerableCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    strcpy(buffer, input);\n    return process_tag_internal(buffer);\n}`,
    patchedCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    \n    // Verified secure remediation\n    if (input == nullptr) {\n        return ERROR_INVALID_NULL_INPUT;\n    }\n    \n    size_t input_len = strlen(input);\n    if (input_len >= sizeof(buffer)) {\n        // Explicit rejection of oversized payloads\n        return ERROR_HEADER_TOO_LONG;\n    }\n    \n    memcpy(buffer, input, input_len);\n    buffer[input_len] = '\\0';\n    \n    return process_tag_internal(buffer);\n}`,
    diffText: `--- a/src/parser.cpp\n+++ b/src/parser.cpp\n@@ -139,4 +139,12 @@\n int parse_header_tag(const char* input) {\n     char buffer[64];\n-    strcpy(buffer, input);\n-    return process_tag_internal(buffer);\n+    \n+    if (input == nullptr) {\n+        return ERROR_INVALID_NULL_INPUT;\n+    }\n+    \n+    size_t input_len = strlen(input);\n+    if (input_len >= sizeof(buffer)) {\n+        return ERROR_HEADER_TOO_LONG;\n+    }\n+    \n+    memcpy(buffer, input, input_len);\n+    buffer[input_len] = '\\0';\n+    \n+    return process_tag_internal(buffer);\n }`,
    verificationReason: 'PASSED INDEPENDENT VERIFICATION: Original PoV blocked safely with return code ERROR_HEADER_TOO_LONG. 1,250 adversarial mutation attacks survived with 0 crashes. 47/47 regression tests passed.',
    compilerLogs: 'CMake Build: Succeeded. Clang-Tidy: 0 warnings. AddressSanitizer: Clean.'
  }
];

export const DEMO_VERIFICATION_RESULT: VerificationResult = {
  decision: 'PASS',
  confidence: 96,
  reason: 'The original PoV no longer reproduces the vulnerable behavior. The patched project builds successfully, all 47 functional regression tests remain successful, and 1,250 adversarial mutation rounds produced zero crashes or memory corruption.',
  verifier: 'Independent Verification Agent (Isolated Context Sandbox)',
  isolatedProofCheck: true,
  retestOriginalPoV: 'BLOCKED',
  breakMyPatchPassRate: '1,247 Blocked / 0 Exploits / 3 Graceful Handled',
  regressionResult: '47 / 47 Passed (100%)',
  timestamp: '2026-08-26T05:14:29.412Z'
};

export const DEMO_BREAK_MY_PATCH: BreakMyPatchData = {
  totalCases: 1250,
  blocked: 1247,
  successfulExploits: 0,
  crashes: 0,
  bypassDetected: false,
  categories: [
    { id: 'cat-boundary', name: 'Boundary Inputs (63, 64, 65 bytes)', totalCases: 250, blocked: 250, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-malformed', name: 'Malformed Packets & Null Bytes', totalCases: 200, blocked: 200, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-oversized', name: 'Oversized Payloads (4KB - 64KB)', totalCases: 300, blocked: 300, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-encoding', name: 'Encoding Variations & UTF-8 Multi-byte', totalCases: 150, blocked: 150, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-repeated', name: 'Repeated Rapid Injection (Burst 10k/sec)', totalCases: 150, blocked: 150, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-mutation', name: 'Mutation-Based Genetic Fuzz Payloads', totalCases: 200, blocked: 197, exploits: 0, crashes: 0, status: 'PASSED' }
  ],
  liveLog: [
    '[BMP] Starting Adversarial Fuzz Matrix across 6 attack categories...',
    '[BMP] Category 1/6: Boundary Inputs (63, 64, 65 bytes) -> 250/250 BLOCKED safely (ERR_HEADER_TOO_LONG).',
    '[BMP] Category 2/6: Malformed Packets & Null Byte Injections -> 200/200 Handled without memory fault.',
    '[BMP] Category 3/6: Extreme Oversized Payloads (Up to 64KB) -> 300/300 Cleanly rejected at ingress boundary.',
    '[BMP] Category 4/6: Multi-byte UTF-8 & Hex Escaped Strings -> 150/150 Sanitized without buffer spill.',
    '[BMP] Category 5/6: Rapid High-Frequency Burst Stream -> 150/150 Processed with zero memory leak.',
    '[BMP] Category 6/6: LLM Genetic Mutation Payloads -> 200/200 Executions completed. 0 CRASHES / 0 EXPLOITS.',
    '[BMP] FINAL ADVERSARIAL OUTCOME: PATCH INVARIANT IS PROVEN RESILIENT.'
  ]
};

export const DEMO_REGRESSION: RegressionResult = {
  totalTests: 47,
  passed: 47,
  failed: 0,
  skipped: 0,
  status: 'ALL_PASSED',
  testSuites: [
    { name: 'ParserSuite.ValidStandardHeaders', tests: 12, passed: 12, failed: 0, durationMs: 4.2 },
    { name: 'ParserSuite.ShortTagHandling', tests: 8, passed: 8, failed: 0, durationMs: 2.1 },
    { name: 'ParserSuite.BoundaryValidLength63', tests: 5, passed: 5, failed: 0, durationMs: 1.8 },
    { name: 'NetworkSuite.SocketIngressRouting', tests: 9, passed: 9, failed: 0, durationMs: 3.4 },
    { name: 'NetworkSuite.ConnectionTeardown', tests: 6, passed: 6, failed: 0, durationMs: 1.9 },
    { name: 'UtilSuite.MemoryManagementSanity', tests: 7, passed: 7, failed: 0, durationMs: 2.8 }
  ]
};

export const DEMO_PERFORMANCE: PerformanceResult = {
  baselineMs: 12.4,
  patchedMs: 12.7,
  impactPercent: 2.4,
  status: 'ACCEPTABLE',
  p99BaselineMs: 18.2,
  p99PatchedMs: 18.6,
  memoryBaselineMb: 18.2,
  memoryPatchedMb: 18.3
};

export const DEMO_CERTIFICATE: ProofCertificate = {
  certificateId: 'SC-2026-001847',
  runId: 'RUN-A7F9-28C4',
  projectId: 'PRJ-CPP-PACKET-PARSER',
  projectName: 'packet-parser-demo',
  vulnerability: 'Stack Buffer Overflow (CWE-121)',
  severity: 'HIGH',
  affectedFile: 'src/parser.cpp:142',
  proofOfVulnerability: 'CONFIRMED',
  patchVersion: 'v2 (Bounds Enforced)',
  originalPoVReTest: 'BLOCKED',
  adversarialTestingSummary: '1,250 Cases / 1,247 Blocked / 0 Successful Exploits / 0 Crashes',
  regressionSummary: '47 / 47 Passed (100% Functional Compatibility)',
  performanceImpact: '+2.4% (12.4ms -> 12.7ms)',
  verificationDecision: 'PASS',
  sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  signature: 'ed25519:9f8a84b29c910384a8bc19283e746a5b28190384756cba918237465019283746',
  timestamp: '2026-08-26 05:14:35 UTC',
  issuer: 'SENTINEL-CHAIN Autonomous Verification Authority',
  sandboxIsolationLevel: 'Docker Seccomp-BPF + AppArmor Tier 3'
};

export const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 'evt-1', time: '14:32:08', timestampMs: 1771993928000, title: 'RUN STARTED', agent: 'System', category: 'SYSTEM', description: 'Autonomous security pipeline initialized for packet-parser-demo (C++).', status: 'INFO' },
  { id: 'evt-2', time: '14:32:10', timestampMs: 1771993930000, title: 'PROJECT DETECTED', agent: 'Recon Agent', category: 'RECON', description: 'Identified CMake build configuration, 18 source files, 74 functions, GoogleTest suite.', status: 'SUCCESS' },
  { id: 'evt-3', time: '14:32:18', timestampMs: 1771993938000, title: 'ATTACK SURFACE IDENTIFIED', agent: 'Attack Surface Agent', category: 'RECON', description: 'Mapped untrusted TCP packet receiver socket entry point to parse_header_tag.', status: 'INFO' },
  { id: 'evt-4', time: '14:32:31', timestampMs: 1771993951000, title: 'HIGH-RISK FINDING DISCOVERED', agent: 'Static Analysis Agent', category: 'STATIC', description: 'Semgrep rule detected unbounded strcpy into 64-byte stack allocation at parser.cpp:142.', status: 'ALERT' },
  { id: 'evt-5', time: '14:32:56', timestampMs: 1771993976000, title: 'CRASH FOUND (FUZZING)', agent: 'Fuzzing Agent', category: 'FUZZ', description: 'LibFuzzer + AddressSanitizer triggered SIGSEGV stack-buffer-overflow after 4,812 executions.', status: 'ALERT' },
  { id: 'evt-6', time: '14:33:02', timestampMs: 1771993982000, title: 'POV CONFIRMED (10/10)', agent: 'Exploit Validation Agent', category: 'POV', description: 'Synthesized minimal binary trigger input pov_crash_001.bin with 10/10 reproduction fidelity.', status: 'ALERT' },
  { id: 'evt-7', time: '14:33:15', timestampMs: 1771993995000, title: 'PATCH GENERATED (v2)', agent: 'Patch Agent', category: 'PATCH', description: 'Synthesized bounded memcpy remediation with explicit ERROR_HEADER_TOO_LONG check.', status: 'INFO' },
  { id: 'evt-8', time: '14:33:26', timestampMs: 1771994006000, title: 'PATCH BUILT SUCCESSFULLY', agent: 'Patch Agent', category: 'PATCH', description: 'CMake project recompiled cleanly with Clang 18 and AddressSanitizer flags enabled.', status: 'SUCCESS' },
  { id: 'evt-9', time: '14:33:40', timestampMs: 1771994020000, title: 'ORIGINAL POV BLOCKED', agent: 'Verification Agent', category: 'VERIFY', description: 'Re-tested pov_crash_001.bin against patched binary. Exploit safely blocked with error code.', status: 'SUCCESS' },
  { id: 'evt-10', time: '14:34:02', timestampMs: 1771994042000, title: 'BREAK MY PATCH COMPLETED', agent: 'Break My Patch Agent', category: 'ADVERSARIAL', description: '1,250 adversarial mutation rounds survived with 0 crashes and 0 exploit bypasses.', status: 'SUCCESS' },
  { id: 'evt-11', time: '14:34:18', timestampMs: 1771994058000, title: 'REGRESSION TESTS PASSED', agent: 'Regression Agent', category: 'REGRESSION', description: 'GoogleTest functional test suite: 47 / 47 test cases passed (100%).', status: 'SUCCESS' },
  { id: 'evt-12', time: '14:34:29', timestampMs: 1771994069000, title: 'VERIFICATION PASSED', agent: 'Verification Agent', category: 'VERIFY', description: 'Independent zero-bias verification decision: PASS (Confidence: 96%).', status: 'SUCCESS' },
  { id: 'evt-13', time: '14:34:35', timestampMs: 1771994075000, title: 'CERTIFICATE GENERATED', agent: 'Proof Agent', category: 'CERT', description: 'Minted cryptographic Proof Certificate SC-2026-001847 with SHA-256 seal.', status: 'SUCCESS' }
];

export const DEMO_LOGS: ConsoleLogMessage[] = [
  { id: 'log-1', time: '14:32:08', type: 'SYSTEM', tag: 'BOOT', message: '[14:32:08] RUN_STARTED - Target: packet-parser-demo (Job ID: RUN-A7F9-28C4)' },
  { id: 'log-2', time: '14:32:10', type: 'INFO', tag: 'RECON', message: '[14:32:10] PROJECT_DETECTED: Language=C++20, BuildSystem=CMake, Files=18, LOC=3420' },
  { id: 'log-3', time: '14:32:14', type: 'AGENT', tag: 'RECON', message: '[14:32:14] AGENT_STARTED: Recon Agent -> Indexing symbol hierarchy and AST call graph' },
  { id: 'log-4', time: '14:32:18', type: 'INFO', tag: 'SURFACE', message: '[14:32:18] ATTACK_SURFACE_IDENTIFIED: Ingress point src/network.cpp:118 (raw socket read)' },
  { id: 'log-5', time: '14:32:25', type: 'AGENT', tag: 'STATIC', message: '[14:32:25] TOOL_STARTED: Semgrep Security Rules & Clang-Tidy static pass' },
  { id: 'log-6', time: '14:32:31', type: 'DANGER', tag: 'STATIC', message: '[14:32:31] STATIC_FINDING: HIGH - src/parser.cpp:142 unsafe strcpy(buffer, input) without bounds check' },
  { id: 'log-7', time: '14:32:40', type: 'AGENT', tag: 'FUZZ', message: '[14:32:40] FUZZING_STARTED: LibFuzzer target `fuzz_parser_tag` with AddressSanitizer' },
  { id: 'log-8', time: '14:32:56', type: 'DANGER', tag: 'CRASH', message: '[14:32:56] CRASH_FOUND: SEGV stack-buffer-overflow at PC 0x55d8e92f1b4a (offset +64)' },
  { id: 'log-9', time: '14:33:02', type: 'WARN', tag: 'POV', message: '[14:33:02] POV_CONFIRMED: pov_crash_001.bin reproduces stack smash 10/10 times' },
  { id: 'log-10', time: '14:33:15', type: 'AGENT', tag: 'PATCH', message: '[14:33:15] PATCH_GENERATED: Candidate #2 synthesized with length guard invariant' },
  { id: 'log-11', time: '14:33:26', type: 'SUCCESS', tag: 'BUILD', message: '[14:33:26] PATCH_BUILD_SUCCESS: Binary recompiled cleanly with ASan instrumentation' },
  { id: 'log-12', time: '14:33:38', type: 'AGENT', tag: 'VERIFY', message: '[14:33:38] VERIFICATION_STARTED: Isolated Verification Sandbox evaluating PoV re-test' },
  { id: 'log-13', time: '14:33:45', type: 'SUCCESS', tag: 'VERIFY', message: '[14:33:45] POV_RETEST_BLOCKED: Original attack payload safely rejected (ERROR_HEADER_TOO_LONG)' },
  { id: 'log-14', time: '14:33:55', type: 'AGENT', tag: 'BMP', message: '[14:33:55] BREAK_MY_PATCH_STARTED: Launching 1,250 mutational & boundary stress cases' },
  { id: 'log-15', time: '14:34:10', type: 'SUCCESS', tag: 'BMP', message: '[14:34:10] BREAK_MY_PATCH_PASSED: 1,247 blocked, 0 bypasses, 0 crashes detected' },
  { id: 'log-16', time: '14:34:20', type: 'SUCCESS', tag: 'REGRESS', message: '[14:34:20] REGRESSION_PASSED: GoogleTest 47/47 functional test cases green' },
  { id: 'log-17', time: '14:34:28', type: 'INFO', tag: 'PERF', message: '[14:34:28] PERF_EVALUATED: Baseline=12.4ms -> Patched=12.7ms (+2.4% overhead, within SLA)' },
  { id: 'log-18', time: '14:34:35', type: 'SUCCESS', tag: 'CERT', message: '[14:34:35] CERTIFICATE_ISSUED: Proof Certificate SC-2026-001847 generated with SHA-256 seal' }
];

export const INITIAL_SECURITY_RUN: SecurityRun = {
  runId: 'RUN-A7F9-28C4',
  projectId: 'PRJ-CPP-PACKET-PARSER',
  projectName: 'packet-parser-demo',
  startedAt: '2026-08-26 14:32:08 UTC',
  completedAt: '2026-08-26 14:34:35 UTC',
  overallStatus: 'VERIFIED',
  currentStage: 'certificate',
  stages: INITIAL_STAGES,
  agents: INITIAL_AGENTS,
  projectProfile: DEMO_PROJECT_PROFILE,
  findings: DEMO_FINDINGS,
  pov: DEMO_POV,
  patchAttempts: DEMO_PATCH_ATTEMPTS,
  activePatchIndex: 1,
  verificationResult: DEMO_VERIFICATION_RESULT,
  breakMyPatch: DEMO_BREAK_MY_PATCH,
  regression: DEMO_REGRESSION,
  performance: DEMO_PERFORMANCE,
  certificate: DEMO_CERTIFICATE,
  timeline: DEMO_TIMELINE,
  logs: DEMO_LOGS
};
