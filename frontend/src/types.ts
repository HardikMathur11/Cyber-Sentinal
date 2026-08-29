export type SafetyMode = 'OBSERVE' | 'ASSIST' | 'AUTONOMOUS';

export type NavView =
  | 'command-center'
  | 'live-operation'
  | 'project-intelligence'
  | 'vulnerabilities'
  | 'pov'
  | 'patch-center'
  | 'verification'
  | 'break-my-patch'
  | 'regression-performance'
  | 'time-machine'
  | 'agent-control'
  | 'certificates'
  | 'analytics';

export type PipelineStageId =
  | 'upload'
  | 'recon'
  | 'attack_surface'
  | 'static_analysis'
  | 'fuzzing'
  | 'pov'
  | 'patch'
  | 'verify'
  | 'break_my_patch'
  | 'regression'
  | 'performance'
  | 'certificate';

export type StageStatus = 'waiting' | 'running' | 'success' | 'failed' | 'warning';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  shortName: string;
  status: StageStatus;
  description: string;
  durationMs?: number;
  outputSummary?: string;
  agentResponsible: string;
}

export type AgentStatusType = 'IDLE' | 'RUNNING' | 'WAITING_INPUT' | 'COMPLETED' | 'ERROR';

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: AgentStatusType;
  provider: string;
  tools: string[];
  currentTask: string;
  progressPercent: number;
  activeFile?: string;
  iconName: string;
  summary: string;
}

import { ProjectDirectoryGraphData } from './data/directoryData';

export interface ProjectProfile {
  name: string;
  language: string;
  framework: string;
  buildSystem: string;
  fileCount: number;
  functionCount: number;
  dependencyCount: number;
  testFramework: string;
  supportedAnalysis: string[];
  entryPoints: string[];
  linesOfCode: number;
  graphData?: ProjectDirectoryGraphData;
}

export interface Finding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  type: string;
  cwe: string;
  cvss: number;
  file: string;
  line: number;
  col?: number;
  functionName: string;
  status: 'CONFIRMED' | 'INVESTIGATING' | 'PATCHED' | 'VERIFIED' | 'FALSE_POSITIVE';
  summary: string;
  description: string;
  vulnerableSnippet: string;
  attackPath: string[];
  staticEvidence: string;
  runtimeEvidence: string;
  reproductionCount: string;
  triggerInputFilename: string;
}

export interface ProofOfVulnerability {
  target: string;
  vulnerability: string;
  reproductionRate: string; // e.g. "10 / 10"
  crashDetails: string;
  triggerInputName: string;
  triggerInputHex: string;
  triggerInputAscii: string;
  sanitizerLog: string;
  evidenceItems: {
    title: string;
    description: string;
    verified: boolean;
  }[];
}

export interface PatchAttempt {
  attemptNumber: number;
  patchId: string;
  status: 'GENERATED' | 'BUILD_FAILED' | 'FAILED_VERIFICATION' | 'VERIFIED' | 'APPLIED';
  author: string;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  buildStatus: 'SUCCESS' | 'FAILED';
  securityProperty: string;
  vulnerableCode: string;
  patchedCode: string;
  diffText: string;
  verificationReason: string;
  compilerLogs: string;
}

export interface VerificationResult {
  decision: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
  confidence: number;
  reason: string;
  verifier: string;
  isolatedProofCheck: boolean;
  retestOriginalPoV: 'BLOCKED' | 'EXPLOITABLE' | 'UNTESTED';
  breakMyPatchPassRate: string;
  regressionResult: string;
  timestamp: string;
}

export interface BreakMyPatchCategory {
  id: string;
  name: string;
  totalCases: number;
  blocked: number;
  exploits: number;
  crashes: number;
  status: 'PASSED' | 'FAILED' | 'TESTING' | 'PENDING';
}

export interface BreakMyPatchData {
  totalCases: number;
  blocked: number;
  successfulExploits: number;
  crashes: number;
  categories: BreakMyPatchCategory[];
  liveLog: string[];
  bypassDetected: boolean;
}

export interface RegressionResult {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  status: 'ALL_PASSED' | 'REGRESSIONS_FOUND' | 'RUNNING' | 'PENDING';
  testSuites: {
    name: string;
    tests: number;
    passed: number;
    failed: number;
    durationMs: number;
  }[];
}

export interface PerformanceResult {
  baselineMs: number;
  patchedMs: number;
  impactPercent: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED';
  p99BaselineMs: number;
  p99PatchedMs: number;
  memoryBaselineMb: number;
  memoryPatchedMb: number;
}

export interface ProofCertificate {
  certificateId: string;
  runId: string;
  projectId: string;
  projectName: string;
  vulnerability: string;
  severity: string;
  affectedFile: string;
  proofOfVulnerability: 'CONFIRMED' | 'UNCONFIRMED';
  patchVersion: string;
  originalPoVReTest: 'BLOCKED' | 'BYPASSED';
  adversarialTestingSummary: string;
  regressionSummary: string;
  performanceImpact: string;
  verificationDecision: 'PASS' | 'FAIL';
  sha256Hash: string;
  signature: string;
  timestamp: string;
  issuer: string;
  sandboxIsolationLevel: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  timestampMs: number;
  title: string;
  agent: string;
  category: 'RECON' | 'STATIC' | 'FUZZ' | 'POV' | 'PATCH' | 'VERIFY' | 'ADVERSARIAL' | 'REGRESSION' | 'CERT' | 'SYSTEM';
  description: string;
  status: 'SUCCESS' | 'ALERT' | 'INFO' | 'WARN';
  detailsPayload?: string;
}

export interface ConsoleLogMessage {
  id: string;
  time: string;
  type: 'INFO' | 'AGENT' | 'WARN' | 'DANGER' | 'SUCCESS' | 'SYSTEM';
  tag: string;
  message: string;
}

export interface SecurityRun {
  runId: string;
  projectId: string;
  projectName: string;
  startedAt: string;
  completedAt?: string;
  overallStatus: 'IDLE' | 'RUNNING' | 'VERIFIED' | 'FAILED' | 'PAUSED';
  currentStage: PipelineStageId;
  stages: PipelineStage[];
  agents: AgentInfo[];
  projectProfile: ProjectProfile;
  findings: Finding[];
  pov: ProofOfVulnerability;
  patchAttempts: PatchAttempt[];
  activePatchIndex: number;
  verificationResult: VerificationResult;
  breakMyPatch: BreakMyPatchData;
  regression: RegressionResult;
  performance: PerformanceResult;
  certificate: ProofCertificate;
  timeline: TimelineEvent[];
  logs: ConsoleLogMessage[];
}
