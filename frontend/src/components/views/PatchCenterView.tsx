import React, { useState, useRef } from 'react';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Play,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  RefreshCw,
  Clock,
  Code2,
  Zap,
  AlertTriangle,
  Award,
  FolderGit2,
  ChevronRight,
  GitPullRequest,
  Check,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatchAttempt, SafetyMode, BreakMyPatchData } from '../../types';
import { SyntaxCodeBlock } from '../SyntaxCodeBlock';
import { playCyberBlip, playSuccessChime, playAlertSound } from '../../utils/audio';

interface ProjectPatchGroup {
  projectId: string;
  projectName: string;
  language: string;
  vulnId: string;
  vulnTitle: string;
  cwe: string;
  severity: string;
  patches: PatchAttempt[];
}

const MULTI_PROJECT_PATCHES: ProjectPatchGroup[] = [
  {
    projectId: 'packet-parser-demo',
    projectName: 'Packet Parser Daemon',
    language: 'C++',
    vulnId: 'VULN-001',
    vulnTitle: 'Stack Buffer Overflow in parse_header_tag',
    cwe: 'CWE-121',
    severity: 'HIGH',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-PARSER-01',
        status: 'FAILED_VERIFICATION',
        author: 'Patch Agent (Candidate #1 - Naive strncpy)',
        filesChanged: 1,
        linesAdded: 3,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Naive truncation without null termination guarantee',
        vulnerableCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    // [CRITICAL ERROR]: Unchecked copy of untrusted payload\n    strcpy(buffer, input);\n    return process_tag_internal(buffer);\n}`,
        patchedCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    // Naive patch attempt #1 (Unsafe without null terminator)\n    strncpy(buffer, input, sizeof(buffer));\n    return process_tag_internal(buffer);\n}`,
        diffText: `--- a/src/parser.cpp\n+++ b/src/parser.cpp\n@@ -140,3 +140,4 @@\n     char buffer[64];\n-    strcpy(buffer, input);\n+    // Naive patch attempt #1\n+    strncpy(buffer, input, sizeof(buffer));\n     return process_tag_internal(buffer);`,
        verificationReason: 'REJECTED: When input length >= 64, strncpy does NOT null-terminate buffer, triggering out-of-bounds read.',
        compilerLogs: 'CMake Build: Succeeded. Clang-Tidy: Warning - strncpy may leave destination unterminated.'
      },
      {
        attemptNumber: 2,
        patchId: 'PATCH-PARSER-02',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #2 - Strict Invariant Guard)',
        filesChanged: 1,
        linesAdded: 8,
        linesRemoved: 2,
        buildStatus: 'SUCCESS',
        securityProperty: 'Explicit length pre-validation with safe bounded copy & null termination invariant',
        vulnerableCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    // [CRITICAL ERROR]: Unchecked copy of untrusted payload\n    strcpy(buffer, input);\n    return process_tag_internal(buffer);\n}`,
        patchedCode: `int parse_header_tag(const char* input) {\n    char buffer[64];\n    \n    // Verified secure remediation\n    if (input == nullptr) {\n        return ERROR_INVALID_NULL_INPUT;\n    }\n    \n    size_t input_len = strlen(input);\n    if (input_len >= sizeof(buffer)) {\n        // Explicit rejection of oversized payloads\n        return ERROR_HEADER_TOO_LONG;\n    }\n    \n    memcpy(buffer, input, input_len);\n    buffer[input_len] = '\\0';\n    \n    return process_tag_internal(buffer);\n}`,
        diffText: `--- a/src/parser.cpp\n+++ b/src/parser.cpp\n@@ -139,4 +139,12 @@\n int parse_header_tag(const char* input) {\n     char buffer[64];\n-    strcpy(buffer, input);\n-    return process_tag_internal(buffer);\n+    \n+    if (input == nullptr) {\n+        return ERROR_INVALID_NULL_INPUT;\n+    }\n+    \n+    size_t input_len = strlen(input);\n+    if (input_len >= sizeof(buffer)) {\n+        return ERROR_HEADER_TOO_LONG;\n+    }\n+    \n+    memcpy(buffer, input, input_len);\n+    buffer[input_len] = '\\0';\n+    \n+    return process_tag_internal(buffer);\n }`,
        verificationReason: 'PASSED INDEPENDENT VERIFICATION: Original PoV blocked safely with return code ERROR_HEADER_TOO_LONG. 1,250 adversarial mutations survived with 0 crashes. 78/78 regression tests passed.',
        compilerLogs: 'CMake Build: Succeeded. Clang-Tidy: 0 warnings. AddressSanitizer: 0 violations.'
      }
    ]
  },
  {
    projectId: 'crypto-auth-daemon',
    projectName: 'Crypto Auth Daemon',
    language: 'C',
    vulnId: 'VULN-002',
    vulnTitle: 'Integer Truncation in Frame Size Handler',
    cwe: 'CWE-190',
    severity: 'MEDIUM',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-CRYPTO-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Safe Integer Bounds)',
        filesChanged: 1,
        linesAdded: 5,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Explicit uint32_t to size_t type preservation and MAX_FRAME validation',
        vulnerableCode: `int read_frame_payload(int sock, uint32_t raw_len) {\n    short frame_size = (short)raw_len; // [BUG]: Integer truncation\n    if (frame_size > MAX_FRAME) return -1;\n    return read_bytes(sock, frame_size);\n}`,
        patchedCode: `int read_frame_payload(int sock, uint32_t raw_len) {\n    // [FIX]: Preserve 32-bit width and check upper bound safely\n    if (raw_len > MAX_FRAME_SAFE_BYTES || raw_len == 0) {\n        return ERROR_INVALID_FRAME_LENGTH;\n    }\n    size_t safe_frame_size = (size_t)raw_len;\n    return read_bytes(sock, safe_frame_size);\n}`,
        diffText: `--- a/src/network.cpp\n+++ b/src/network.cpp\n@@ -85,4 +85,7 @@\n int read_frame_payload(int sock, uint32_t raw_len) {\n-    short frame_size = (short)raw_len;\n-    if (frame_size > MAX_FRAME) return -1;\n-    return read_bytes(sock, frame_size);\n+    if (raw_len > MAX_FRAME_SAFE_BYTES || raw_len == 0) {\n+        return ERROR_INVALID_FRAME_LENGTH;\n+    }\n+    size_t safe_frame_size = (size_t)raw_len;\n+    return read_bytes(sock, safe_frame_size);\n }`,
        verificationReason: 'PASSED INDEPENDENT VERIFICATION: Integer wrapping payload no longer bypasses maximum buffer boundaries.',
        compilerLogs: 'GCC Build: Clean with -Wall -Wextra. Sanitizer check clean.'
      }
    ]
  },
  {
    projectId: 'kernel-driver-io',
    projectName: 'Kernel Driver IO Subsystem',
    language: 'C',
    vulnId: 'VULN-003',
    vulnTitle: 'Use-After-Free in Packet Session Table',
    cwe: 'CWE-416',
    severity: 'CRITICAL',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-KERNEL-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - RAII Table Erase Guard)',
        filesChanged: 1,
        linesAdded: 4,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Erase session from global table before pointer deallocation',
        vulnerableCode: `void terminate_session(Session* s) {\n    close(s->socket_fd);\n    delete s; // [BUG]: Table still holds dangling pointer\n    log_event("Session terminated", s->id);\n}`,
        patchedCode: `void terminate_session(Session* s) {\n    if (!s) return;\n    uint64_t sid = s->id;\n    close(s->socket_fd);\n    g_session_table.erase(sid); // Erased before free\n    delete s;\n    log_event("Session terminated", sid);\n}`,
        diffText: `--- a/src/session_manager.cpp\n+++ b/src/session_manager.cpp\n@@ -204,3 +204,6 @@\n+    if (!s) return;\n+    uint64_t sid = s->id;\n     close(s->socket_fd);\n+    g_session_table.erase(sid);\n     delete s;`,
        verificationReason: 'PASSED: ASan confirms 0 heap-use-after-free read violations across 2,000 parallel termination tests.',
        compilerLogs: 'Clang 18: Build succeeded with -fsanitize=address,undefined.'
      }
    ]
  },
  {
    projectId: 'wasm-sandbox-vm',
    projectName: 'WASM Sandbox VM',
    language: 'C++',
    vulnId: 'VULN-004',
    vulnTitle: 'Heap Out-of-Bounds in LZW Codec',
    cwe: 'CWE-787',
    severity: 'HIGH',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-WASM-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Dynamic Capacity Bound Check)',
        filesChanged: 1,
        linesAdded: 6,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Pre-check output index against out_max before write',
        vulnerableCode: `while (has_tokens(stream)) {\n    Token t = next_token(stream);\n    // [BUG]: Missing bounds validation against out_max\n    out[write_idx++] = dictionary[t.code];\n}`,
        patchedCode: `while (has_tokens(stream)) {\n    Token t = next_token(stream);\n    if (write_idx >= out_max) {\n        return ERROR_DECOMPRESSION_OVERFLOW;\n    }\n    out[write_idx++] = dictionary[t.code];\n}`,
        diffText: `--- a/src/codec_decoder.cpp\n+++ b/src/codec_decoder.cpp\n@@ -312,2 +312,7 @@\n     Token t = next_token(stream);\n+    if (write_idx >= out_max) {\n+        return ERROR_DECOMPRESSION_OVERFLOW;\n+    }\n     out[write_idx++] = dictionary[t.code];`,
        verificationReason: 'PASSED: Out-of-bounds write blocked. Decompression overflow cleanly handled.',
        compilerLogs: 'Ninja / Clang: Build passed. UBSan and ASan clean.'
      }
    ]
  },
  {
    projectId: 'tls-handshake-engine',
    projectName: 'TLS Handshake Engine',
    language: 'Rust / C',
    vulnId: 'VULN-005',
    vulnTitle: 'NULL Pointer Dereference on SNI Extension',
    cwe: 'CWE-476',
    severity: 'MEDIUM',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-TLS-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Option/Result Non-null Guard)',
        filesChanged: 1,
        linesAdded: 4,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Explicit null verification before SNIExtension struct dereference',
        vulnerableCode: `SNIExtension* sni = parse_sni_raw(ext_data);\n// [BUG]: sni is NULL when length is 0\nif (sni->host_type == 0) {\n    store_sni_hostname(sni->host_name);\n}`,
        patchedCode: `SNIExtension* sni = parse_sni_raw(ext_data);\nif (sni == nullptr) {\n    return TLS_ERR_MALFORMED_SNI;\n}\nif (sni->host_type == 0) {\n    store_sni_hostname(sni->host_name);\n}`,
        diffText: `--- a/src/tls_adapter.cpp\n+++ b/src/tls_adapter.cpp\n@@ -95,2 +95,5 @@\n SNIExtension* sni = parse_sni_raw(ext_data);\n+if (sni == nullptr) {\n+    return TLS_ERR_MALFORMED_SNI;\n+}\n if (sni->host_type == 0) {`,
        verificationReason: 'PASSED: 0-byte SNI payload returns error code with zero null-pointer crashes.',
        compilerLogs: 'GCC 14: Build succeeded.'
      }
    ]
  },
  {
    projectId: 'dns-resolver-core',
    projectName: 'DNS Resolver Core',
    language: 'C++',
    vulnId: 'VULN-006',
    vulnTitle: 'Format String Injection in Syslog Facility',
    cwe: 'CWE-134',
    severity: 'HIGH',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-DNS-LOG-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Format Literal Enforcement)',
        filesChanged: 1,
        linesAdded: 3,
        linesRemoved: 2,
        buildStatus: 'SUCCESS',
        securityProperty: 'Constant format string literal "%s" with untrusted variable as argument',
        vulnerableCode: `void log_client_error(const char* user_tag) {\n    // [CRITICAL ERROR]: user_tag contains %x%s%n\n    printf(user_tag);\n    syslog(LOG_ERR, user_tag);\n}`,
        patchedCode: `void log_client_error(const char* user_tag) {\n    // [REMEDIATED]: Constant format string enforced\n    syslog(LOG_ERR, "%s", user_tag ? user_tag : "(null)");\n}`,
        diffText: `--- a/src/logger.cpp\n+++ b/src/logger.cpp\n@@ -54,3 +54,2 @@\n-    printf(user_tag);\n-    syslog(LOG_ERR, user_tag);\n+    syslog(LOG_ERR, "%s", user_tag ? user_tag : "(null)");`,
        verificationReason: 'PASSED: %x and %n format string injection payloads rendered safely as plain string literals.',
        compilerLogs: 'Clang 18 -Wformat-security: 0 warnings.'
      }
    ]
  },
  {
    projectId: 'api-gateway-mesh',
    projectName: 'API Gateway Mesh',
    language: 'Go / C',
    vulnId: 'VULN-007',
    vulnTitle: 'Command Injection via Ping Tool',
    cwe: 'CWE-78',
    severity: 'CRITICAL',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-GW-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Execv Parameterized Array)',
        filesChanged: 1,
        linesAdded: 8,
        linesRemoved: 3,
        buildStatus: 'SUCCESS',
        securityProperty: 'Replace shell interpretation system() with safe execv direct binary invocation',
        vulnerableCode: `int run_diagnostic_ping(const char* target_ip) {\n    char cmd[256];\n    // [CRITICAL]: Shell injection\n    sprintf(cmd, "ping -c 1 %s", target_ip);\n    return system(cmd);\n}`,
        patchedCode: `int run_diagnostic_ping(const char* target_ip) {\n    if (!is_valid_ipv4(target_ip)) return -1;\n    char* const args[] = {"/bin/ping", "-c", "1", (char*)target_ip, NULL};\n    pid_t pid = fork();\n    if (pid == 0) {\n        execv("/bin/ping", args);\n        _exit(1);\n    }\n    waitpid(pid, NULL, 0);\n    return 0;\n}`,
        diffText: `--- a/src/admin_tools.cpp\n+++ b/src/admin_tools.cpp\n@@ -182,4 +182,9 @@\n-    char cmd[256];\n-    sprintf(cmd, "ping -c 1 %s", target_ip);\n-    return system(cmd);\n+    if (!is_valid_ipv4(target_ip)) return -1;\n+    char* const args[] = {"/bin/ping", "-c", "1", (char*)target_ip, NULL};\n+    pid_t pid = fork();\n+    if (pid == 0) { execv("/bin/ping", args); _exit(1); }\n+    waitpid(pid, NULL, 0);\n+    return 0;`,
        verificationReason: 'PASSED: Command separator payloads (; /bin/sh) treated as literal invalid IP strings without execution.',
        compilerLogs: 'GCC: Succeeded. Sandbox audit confirmed 0 sub-shell forks.'
      }
    ]
  },
  {
    projectId: 'blob-storage-manager',
    projectName: 'Blob Storage Manager',
    language: 'C',
    vulnId: 'VULN-008',
    vulnTitle: 'Path Traversal File Overwrite',
    cwe: 'CWE-22',
    severity: 'HIGH',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-BLOB-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Canonical realpath Root Confinement)',
        filesChanged: 1,
        linesAdded: 7,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Sanitize filename and enforce target path starts with base root directory',
        vulnerableCode: `char filepath[512];\nsnprintf(filepath, sizeof(filepath), "/var/data/%s", filename);\nFILE* f = fopen(filepath, "wb");`,
        patchedCode: `char filepath[512];\nif (strstr(filename, "..") || strchr(filename, '/')) {\n    return ERROR_INVALID_PATH;\n}\nsnprintf(filepath, sizeof(filepath), "/var/data/%s", filename);\nFILE* f = fopen(filepath, "wb");`,
        diffText: `--- a/src/storage_manager.cpp\n+++ b/src/storage_manager.cpp\n@@ -110,2 +110,6 @@\n+if (strstr(filename, "..") || strchr(filename, '/')) {\n+    return ERROR_INVALID_PATH;\n+}\n snprintf(filepath, sizeof(filepath), "/var/data/%s", filename);`,
        verificationReason: 'PASSED: ../ path traversal sequences rejected with ERROR_INVALID_PATH.',
        compilerLogs: 'Build clean.'
      }
    ]
  },
  {
    projectId: 'ipc-message-broker',
    projectName: 'IPC Message Broker',
    language: 'C',
    vulnId: 'VULN-009',
    vulnTitle: 'Double Free on Connection Timeout Reset',
    cwe: 'CWE-415',
    severity: 'MEDIUM',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-IPC-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - Nullify-After-Free Pointer Guard)',
        filesChanged: 1,
        linesAdded: 3,
        linesRemoved: 1,
        buildStatus: 'SUCCESS',
        securityProperty: 'Explicitly set buffer pointer to NULL immediately after deallocation',
        vulnerableCode: `void on_socket_timeout(SocketContext* ctx) {\n    if (ctx->read_buffer) {\n        free(ctx->read_buffer);\n    }\n    cleanup_socket_error(ctx);\n}`,
        patchedCode: `void on_socket_timeout(SocketContext* ctx) {\n    if (ctx->read_buffer) {\n        free(ctx->read_buffer);\n        ctx->read_buffer = NULL; // Prevent secondary free\n    }\n    cleanup_socket_error(ctx);\n}`,
        diffText: `--- a/src/io_multiplexer.cpp\n+++ b/src/io_multiplexer.cpp\n@@ -230,2 +230,4 @@\n     if (ctx->read_buffer) {\n         free(ctx->read_buffer);\n+        ctx->read_buffer = NULL;\n     }`,
        verificationReason: 'PASSED: Double-free eliminated under AddressSanitizer stress harness.',
        compilerLogs: 'GCC: Clean.'
      }
    ]
  },
  {
    projectId: 'oauth2-token-vault',
    projectName: 'OAuth2 Token Vault',
    language: 'C++',
    vulnId: 'VULN-010',
    vulnTitle: 'Race Condition in Token Bucket Rate Limiter',
    cwe: 'CWE-362',
    severity: 'HIGH',
    patches: [
      {
        attemptNumber: 1,
        patchId: 'PATCH-VAULT-01',
        status: 'VERIFIED',
        author: 'Patch Agent (Candidate #1 - std::atomic_fetch_sub CAS Loop)',
        filesChanged: 1,
        linesAdded: 6,
        linesRemoved: 3,
        buildStatus: 'SUCCESS',
        securityProperty: 'Atomic compare-and-swap loop guaranteeing thread-safe token consumption',
        vulnerableCode: `bool consume_token(TokenBucket* b, int count) {\n    if (b->available_tokens >= count) {\n        b->available_tokens -= count;\n        return true;\n    }\n    return false;\n}`,
        patchedCode: `bool consume_token(TokenBucket* b, int count) {\n    int current = b->available_tokens.load();\n    while (current >= count) {\n        if (b->available_tokens.compare_exchange_weak(current, current - count)) {\n            return true;\n        }\n    }\n    return false;\n}`,
        diffText: `--- a/src/rate_limiter.cpp\n+++ b/src/rate_limiter.cpp\n@@ -78,4 +78,7 @@\n-    if (b->available_tokens >= count) {\n-        b->available_tokens -= count;\n-        return true;\n+    int current = b->available_tokens.load();\n+    while (current >= count) {\n+        if (b->available_tokens.compare_exchange_weak(current, current - count)) return true;\n     }`,
        verificationReason: 'PASSED: ThreadSanitizer confirms 0 data races across 500 concurrent threads.',
        compilerLogs: 'Clang 18 -fsanitize=thread: Build succeeded.'
      }
    ]
  }
];

const DEFAULT_BREAK_DATA: BreakMyPatchData = {
  totalCases: 1250,
  blocked: 1247,
  successfulExploits: 0,
  crashes: 0,
  bypassDetected: false,
  categories: [
    { id: 'cat-null-byte', name: 'Null-byte Injection (%00)', totalCases: 200, blocked: 200, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-overflow', name: 'Boundary Integer Overflow (+1)', totalCases: 250, blocked: 250, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-format', name: 'Format String Payload (%s%x)', totalCases: 180, blocked: 180, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-unicode', name: 'Unicode UTF-8 Overlong Encoding', totalCases: 220, blocked: 217, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-concat', name: 'Unbounded Concatenation Spray', totalCases: 200, blocked: 200, exploits: 0, crashes: 0, status: 'PASSED' },
    { id: 'cat-heap', name: 'Heap Chunk Desync Shift', totalCases: 200, blocked: 200, exploits: 0, crashes: 0, status: 'PASSED' },
  ],
  liveLog: [
    '[MUTATOR] Initialized seed corpus: 14 base test vectors',
    '[MUTATOR] Applying byte-flip and length-stretch mutations...',
    '[MUTATOR] Running 1,250 fuzzing iterations against patch v2 invariant...',
    '[SANITY] ASan memory check: ZERO heap/stack overflow violations.',
    '[VERDICT] PASS: Patch v2 survived all 1,250 adversarial payloads.',
  ]
};

const PATCH_GEN_STEPS = [
  { id: 'analyze', label: 'Analyzing vulnerability AST node & data-flow graph...', color: 'text-[#60A5FA]' },
  { id: 'synthesize', label: 'Synthesizing formal security invariant guard (C++ bounds check)...', color: 'text-[#34D399]' },
  { id: 'compile', label: 'Compiling patched translation unit with ASan/UBSan (-O2)...', color: 'text-[#FBBF24]' },
  { id: 'test', label: 'Executing GoogleTest harness & verifying PoV blockage...', color: 'text-[#4ADE80]' },
  { id: 'done', label: '✓ Patch v2 Verified: 100% Invariant Compliant (Zero Regressions)', color: 'text-[#4ADE80]' },
];

interface PatchCenterViewProps {
  patchAttempts: PatchAttempt[];
  activePatchIndex: number;
  onSelectPatchAttempt: (index: number) => void;
  safetyMode: SafetyMode;
  initialTab?: 'matrix' | 'break' | 'verify';
  breakData?: BreakMyPatchData;
  onNavigate: (view: any) => void;
}

export const PatchCenterView: React.FC<PatchCenterViewProps> = ({
  patchAttempts,
  activePatchIndex,
  onSelectPatchAttempt,
  safetyMode,
  initialTab = 'matrix',
  breakData = DEFAULT_BREAK_DATA,
  onNavigate
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'matrix' | 'break' | 'verify'>(initialTab);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('packet-parser-demo');
  const [selectedPatchId, setSelectedPatchId] = useState<string>('PATCH-PARSER-02');
  const [patchSearchQuery, setPatchSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified-diff' | 'compiler-log'>('side-by-side');
  const [building, setBuilding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [approved, setApproved] = useState(false);

  // Filtered multi-project patches
  const filteredProjectPatches = MULTI_PROJECT_PATCHES.filter((p) => {
    const q = patchSearchQuery.toLowerCase();
    return (
      p.projectName.toLowerCase().includes(q) ||
      p.projectId.toLowerCase().includes(q) ||
      p.vulnId.toLowerCase().includes(q) ||
      p.vulnTitle.toLowerCase().includes(q) ||
      p.cwe.toLowerCase().includes(q)
    );
  });

  // Animated patch generation states
  const [generatingPatch, setGeneratingPatch] = useState(false);
  const [genStepIdx, setGenStepIdx] = useState(-1);
  const [genComplete, setGenComplete] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Break My Patch states
  const [runningStressTest, setRunningStressTest] = useState(false);
  const [simulatedBypass, setSimulatedBypass] = useState(false);
  const [testProgress, setTestProgress] = useState(100);

  // Find currently active project and patch
  const activeProject = MULTI_PROJECT_PATCHES.find((p) => p.projectId === selectedProjectId) || MULTI_PROJECT_PATCHES[0];
  const activePatch = activeProject.patches.find((patch) => patch.patchId === selectedPatchId) || activeProject.patches[0];

  const handleSelectPatch = (patch: PatchAttempt, projectId: string) => {
    playCyberBlip(850);
    setSelectedProjectId(projectId);
    setSelectedPatchId(patch.patchId);
    setApproved(false);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleGeneratePatch = () => {
    setGeneratingPatch(true);
    setGenComplete(false);
    setGenStepIdx(0);
    playCyberBlip(1100);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= PATCH_GEN_STEPS.length) {
        clearInterval(interval);
        setGeneratingPatch(false);
        setGenComplete(true);
        setGenStepIdx(PATCH_GEN_STEPS.length - 1);
        setSelectedPatchId('PATCH-PARSER-02');
        playSuccessChime();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }
      playCyberBlip(800 + step * 80);
      setGenStepIdx(step);
    }, 550);
  };

  const handleRunBuild = () => {
    setBuilding(true);
    playCyberBlip(1000);
    setTimeout(() => {
      setBuilding(false);
      playSuccessChime();
    }, 1100);
  };

  const handleTestPatch = () => {
    setTesting(true);
    playCyberBlip(950);
    setTimeout(() => {
      setTesting(false);
      playSuccessChime();
      setActiveMainTab('break');
    }, 1100);
  };

  const handleApprovePatch = () => {
    setApproved(true);
    playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRunAdversarialSuite = () => {
    setRunningStressTest(true);
    setSimulatedBypass(false);
    setTestProgress(0);
    playCyberBlip(1100);

    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunningStressTest(false);
          playSuccessChime();
          return 100;
        }
        playCyberBlip(600 + prev * 5);
        return prev + 25;
      });
    }, 250);
  };

  const handleSimulateBypassDetection = () => {
    setSimulatedBypass(true);
    playAlertSound();
  };

  return (
    <div id="patch-center-view" className="space-y-6 font-sans">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                AUTONOMOUS CODE REASONING & REMEDIATION
              </div>
              <h2 className="text-xl font-black text-[#0F172A]">
                AI Patch Synthesis & Verification Workbench
              </h2>
            </div>
          </div>

          {/* Unified Tab Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-[#F8FAFD] p-1 rounded-xl border border-[#E2E8F0]">
              {[
                { id: 'matrix', label: 'Project Patches', icon: Wrench, activeStyle: 'bg-[#2563EB] text-white' },
                { id: 'break', label: 'Break My Patch', icon: Zap, activeStyle: 'bg-[#0F172A] text-white' },
                { id: 'verify', label: 'Independent Verification', icon: ShieldCheck, activeStyle: 'bg-[#16A34A] text-white' },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeMainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playCyberBlip(700);
                      setActiveMainTab(tab.id as any);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      active ? tab.activeStyle + ' shadow-sm' : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F0F4FA]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action: Generate Patch Button */}
            <button
              onClick={handleGeneratePatch}
              disabled={generatingPatch}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm btn-cyber-blue ${
                generatingPatch ? 'opacity-80 cursor-wait' : 'active:scale-95'
              }`}
            >
              {generatingPatch ? (
                <><span className="w-2 h-2 rounded-full bg-white/80 animate-ping" /><span>SYNTHESIZING PATCH...</span></>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /><span>GENERATE PATCH</span></>
              )}
            </button>
          </div>
        </div>

        {/* Live Animated Patch Generation Stream */}
        {(generatingPatch || genComplete) && (
          <div className="mb-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl overflow-hidden animate-fade-in shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E293B] bg-[#080C14]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#94A3B8] font-mono">AUTONOMOUS PATCH SYNTHESIS ENGINE</span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${genComplete ? 'text-[#4ADE80]' : 'text-[#60A5FA] animate-pulse'}`}>
                {genComplete ? '● SYNTHESIS COMPLETE' : '● EXECUTING INVARIANT SOLVER...'}
              </span>
            </div>
            <div className="p-3.5 space-y-1.5 font-mono text-[11px]">
              {PATCH_GEN_STEPS.slice(0, genStepIdx + 1).map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <span className="text-[#475569] shrink-0 text-[10px]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                  {i === genStepIdx && !genComplete ? (
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                  )}
                  <span className={step.color}>{step.label}</span>
                </div>
              ))}
            </div>
            {genComplete && (
              <div className="px-4 py-2.5 border-t border-[#1E293B] bg-[#080C14] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#4ADE80] font-bold">
                  ✓ Candidate Patch #2 generated and ready — inspect code diff below
                </span>
                <button
                  onClick={() => {
                    playCyberBlip(900);
                    setActiveMainTab('break');
                  }}
                  className="text-[11px] text-[#60A5FA] font-bold hover:text-[#93C5FD] transition-colors flex items-center gap-1"
                >
                  Run Adversarial Fuzzing <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: PROJECT-WISE PATCH MATRIX SELECTOR */}
        {activeMainTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-[#475569] uppercase font-bold flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>SELECT FROM {MULTI_PROJECT_PATCHES.length} REMEDIATION TARGET PROJECTS:</span>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search project, CWE, vuln..."
                  value={patchSearchQuery}
                  onChange={(e) => setPatchSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Project List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProjectPatches.map((proj) => (
                <div
                  key={proj.projectId}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedProjectId === proj.projectId
                      ? 'border-[#2563EB] bg-[#EFF6FF]/40 ring-1 ring-[#2563EB]/30'
                      : 'border-[#E2E8F0] bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0F172A]">{proj.projectName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-[#F8FAFD] text-[#2563EB] border border-[#E2E8F0] font-semibold">
                        {proj.language}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                      {proj.vulnId} · {proj.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] mb-3 font-medium">{proj.vulnTitle} ({proj.cwe})</p>

                  {/* Candidate Patches under this project */}
                  <div className="space-y-2">
                    {proj.patches.map((patch) => {
                      const isSelected = selectedPatchId === patch.patchId && selectedProjectId === proj.projectId;
                      const isVerified = patch.status === 'VERIFIED' || patch.status === 'APPLIED';
                      return (
                        <button
                          key={patch.patchId}
                          onClick={() => handleSelectPatch(patch, proj.projectId)}
                          className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                            isSelected
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                              : 'bg-[#F8FAFD] text-[#0F172A] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:border-[#93C5FD]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {patch.patchId}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : isVerified
                                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                                    : 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
                                }`}
                              >
                                {patch.status}
                              </span>
                            </div>
                            <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-white/90' : 'text-[#64748B]'}`}>
                              {patch.securityProperty}
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL PATCH DETAILS: BEFORE & AFTER CODE INSPECTOR */}
      {activeMainTab === 'matrix' && activePatch && (
        <div ref={detailsRef} className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-2xl shadow-sm space-y-5 animate-fade-in">
          {/* Patch Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                  ACTIVE REMEDIATION CANDIDATE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  {activeProject.projectName}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#0F172A] font-mono">
                {activePatch.patchId} — {activePatch.author}
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                Security Invariant: <strong className="text-[#0F172A]">{activePatch.securityProperty}</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRunBuild}
                disabled={building}
                className="px-3.5 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-bold flex items-center gap-1.5 text-[#0F172A] transition-all active:scale-95 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${building ? 'animate-spin text-[#2563EB]' : ''}`} />
                <span>{building ? 'RECOMPILING...' : 'RECOMPILE'}</span>
              </button>

              <button
                onClick={handleTestPatch}
                disabled={testing}
                className="px-3.5 py-2 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{testing ? 'TESTING...' : 'RUN BREAK MY PATCH'}</span>
              </button>

              <button
                onClick={handleApprovePatch}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                  approved
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white btn-cyber-blue'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{approved ? 'PATCH APPROVED ✓' : 'APPROVE & APPLY PATCH'}</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-[#F8FAFD] p-1 rounded-xl border border-[#E2E8F0]">
              {[
                { id: 'side-by-side', label: 'Side-by-Side Before & After' },
                { id: 'unified-diff', label: 'Unified Diff' },
                { id: 'compiler-log', label: 'Compiler & Sanitizer Log' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    playCyberBlip(700);
                    setViewMode(mode.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode.id
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#64748B] flex items-center gap-2">
              <span className="text-[#16A34A] font-bold">+{activePatch.linesAdded} lines</span>
              <span>·</span>
              <span className="text-[#DC2626] font-bold">-{activePatch.linesRemoved} lines</span>
            </div>
          </div>

          {/* Mode 1: SIDE BY SIDE BEFORE & AFTER CODE */}
          {viewMode === 'side-by-side' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#BE123C] font-mono px-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    BEFORE: VULNERABLE AST (SRC/PARSER.CPP)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-[#FFF1F2] border border-[#FECDD3]">CWE-121</span>
                </div>
                <SyntaxCodeBlock code={activePatch.vulnerableCode} language="cpp" fileName="src/parser.cpp (vulnerable original)" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] font-mono px-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    AFTER: VERIFIED REMEDIATED (SRC/PARSER.CPP)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
                    BOUNDS ENFORCED
                  </span>
                </div>
                <SyntaxCodeBlock code={activePatch.patchedCode} language="cpp" fileName="src/parser.cpp (remediated invariant)" />
              </div>
            </div>
          )}

          {/* Mode 2: UNIFIED DIFF */}
          {viewMode === 'unified-diff' && (
            <SyntaxCodeBlock
              code={activePatch.diffText || `--- a/src/parser.cpp\n+++ b/src/parser.cpp\n@@ -138,5 +138,13 @@\n int parse_header_tag(const char* input) {\n     char buffer[64];\n-    strcpy(buffer, input);\n+    if (input == nullptr) return ERROR_INVALID_NULL_INPUT;\n+    size_t input_len = strlen(input);\n+    if (input_len >= sizeof(buffer)) return ERROR_HEADER_TOO_LONG;\n+    memcpy(buffer, input, input_len);\n+    buffer[input_len] = '\\0';\n     return process_tag_internal(buffer);`}
              language="diff"
              fileName="remediation_patch.patch"
            />
          )}

          {/* Mode 3: COMPILER & VERIFICATION LOG */}
          {viewMode === 'compiler-log' && (
            <div className="p-4 rounded-xl bg-[#090D16] text-[#E2E8F0] font-mono text-xs space-y-1.5 border border-[#1E293B]">
              <div className="text-emerald-400">[COMPILER] g++ -O2 -Wall -Wextra -fsanitize=address,undefined -c src/parser.cpp -o build/parser.o</div>
              <div className="text-slate-400">[COMPILER] Compilation finished cleanly: 0 warnings, 0 diagnostic errors.</div>
              <div className="text-[#60A5FA]">[VERIFICATION] Executing test_harness --gtest_filter=ParserTest.*</div>
              <div className="text-emerald-400">[GTEST] 47 / 47 test cases PASSED (0.04s execution time).</div>
              <div className="text-[#FBBF24]">[INDEPENDENT JUDGE] Original PoV payload (77 bytes) fed to binary: Return Code = ERROR_HEADER_TOO_LONG (Safe).</div>
              <div className="text-emerald-400">[VERDICT] Formal property proven: Buffer overflow invariant fully satisfied.</div>
            </div>
          )}

          {/* Verification Reason Box */}
          {activePatch.verificationReason && (
            <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Independent Verification Verdict</span>
              <p className="text-xs text-[#334155] leading-relaxed font-medium">{activePatch.verificationReason}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BREAK MY PATCH ADVERSARIAL SUITE */}
      {activeMainTab === 'break' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-xs">
                  <Zap className="w-6 h-6 text-[#2563EB] animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                    ADVERSARIAL STRESS TESTING ENGINE
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A]">
                    Break My Patch Suite
                  </h2>
                  <p className="text-xs text-[#475569] mt-0.5 italic">
                    "Can the synthesized patch survive 1,250 targeted adversarial mutation payloads?"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleRunAdversarialSuite}
                  disabled={runningStressTest}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{runningStressTest ? `FUZZING (${testProgress}%)...` : 'RUN 1,250 ADVERSARIAL CASES'}</span>
                </button>

                <button
                  onClick={handleSimulateBypassDetection}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate Bypass Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bypass Alert Banner */}
          {simulatedBypass && (
            <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-[#BE123C] space-y-2 shadow-xs animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#BE123C] font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-[#BE123C]" />
                  <span>BYPASS DETECTED (Mutated Payload len=129 null-byte injection)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#BE123C] text-white font-bold uppercase">
                  REMEDIAL LOOP ENGAGED
                </span>
              </div>
              <p className="text-xs text-[#BE123C] leading-relaxed font-medium">
                The adversarial engine uncovered an edge case where the patch failed. System will automatically route back to the Patch Agent for remediation synthesis attempt #3.
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">TOTAL MUTATION CASES</span>
              <div className="text-3xl font-black text-[#0F172A] mt-1">{breakData.totalCases.toLocaleString()}</div>
            </div>
            <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">MUTATIONS BLOCKED</span>
              <div className="text-3xl font-black text-[#2563EB] mt-1">{breakData.blocked.toLocaleString()}</div>
            </div>
            <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">EXPLOITS FOUND</span>
              <div className="text-3xl font-black text-[#BE123C] mt-1">{simulatedBypass ? 1 : breakData.successfulExploits}</div>
            </div>
            <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">PASS RATE</span>
              <div className="text-3xl font-black text-[#10B981] mt-1">{simulatedBypass ? '99.9%' : '100%'}</div>
            </div>
          </div>

          {/* Category Table */}
          <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">ATTACK CATEGORY BREAKDOWN</h4>
            <div className="space-y-2">
              {breakData.categories.map((v) => (
                <div key={v.id} className="p-3 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A]">{v.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#475569] font-mono">{v.blocked} / {v.totalCases} Blocked</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                      v.status === 'PASSED'
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                        : 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INDEPENDENT VERIFICATION */}
      {activeMainTab === 'verify' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">ZERO-TRUST EVALUATION · ISOLATED ORACLE</div>
                <h3 className="text-lg font-black text-[#0F172A]">Independent Verification Sandbox</h3>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold">VERDICT: PASS ✓</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-2">
                <div className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold">FINAL VERDICT</div>
                <div className="text-5xl font-black text-[#2563EB]">PASS</div>
                <div className="text-xs text-[#334155] leading-relaxed max-w-xs mx-auto font-medium">
                  Zero hallucination leakage. Verification agent evaluated only objective ground-truth compiler, sanitizer, and fuzzing evidence.
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      playCyberBlip(950);
                      onNavigate('certificates');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 btn-cyber-blue active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    MINT PROOF CERTIFICATE
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1">Objective Evidence Ledger</div>
                {[
                  { label: 'Original PoV payload', detail: 'pov_crash_001.bin — deterministic SIGSEGV' },
                  { label: 'Patched build artifact', detail: 'Compiled clean — 0 ASan/UBSan errors' },
                  { label: 'PoV re-test result', detail: 'BLOCKED — ERROR_HEADER_TOO_LONG returned' },
                  { label: 'Regression suite', detail: '47 / 47 GoogleTest cases passed' },
                  { label: 'Adversarial mutations', detail: '0 exploits across 1,250 payloads' },
                  { label: 'Performance impact', detail: '+2.4% latency (within SLA threshold)' },
                  { label: 'Cryptographic seal', detail: 'SHA-256 hash committed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A]">{item.label}</span>
                      <span className="text-[#475569] ml-2">{item.detail}</span>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE] shrink-0">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
