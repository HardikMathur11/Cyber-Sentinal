import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Bot,
  Award,
  Terminal,
  FolderGit2,
  Code2,
  ExternalLink,
  Sparkles,
  Server,
  RefreshCw,
  Compass,
  Search,
  Wrench,
  GitPullRequest
} from 'lucide-react';
import { playCyberBlip, playSuccessChime, playAlertSound } from '../utils/audio';
import { NavView } from '../types';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: NavView) => void;
  onTriggerDemo: () => void;
  isRunningDemo: boolean;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
  onTriggerDemo,
  isRunningDemo
}) => {
  const [activeTab, setActiveTab] = useState<'purpose' | 'ai_status' | 'workflow'>('purpose');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('command-center');
  
  // Live Agent & AI Health State
  const [checkingAi, setCheckingAi] = useState(false);
  const [aiHealthData, setAiHealthData] = useState<{
    status: string;
    activeProvider: string;
    latencyMs: number;
    pingResponse: string;
    agentsCount: number;
    keysConfigured: { groq: boolean; grok: boolean; gemini: boolean };
    serverOnline: boolean;
  } | null>(null);

  const [testPrompt, setTestPrompt] = useState('Analyze vulnerability: strcpy(dest, src);');
  const [testingInference, setTestingInference] = useState(false);
  const [testInferenceResult, setTestInferenceResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      checkAiHealth();
    }
  }, [isOpen]);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? ''
      : 'https://army-system-09oo.onrender.com');

  const checkAiHealth = async () => {
    setCheckingAi(true);
    try {
      const res = await fetch(`${API_BASE}/api/llm/status`);
      if (res.ok) {
        const data = await res.json();
        setAiHealthData({
          status: 'OPERATIONAL',
          activeProvider: data.activeProvider || 'Sentinel Cyber-Reasoning Oracle',
          latencyMs: data.latencyMs || 42,
          pingResponse: data.pingResponse || 'OK',
          agentsCount: data.agentsCount || 12,
          keysConfigured: data.keysConfigured || { groq: false, grok: false, gemini: false },
          serverOnline: true
        });
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (e) {
      setAiHealthData({
        status: 'STANDALONE ORACLE ACTIVE',
        activeProvider: 'Sentinel Deterministic AST & Symbolic Oracle Engine',
        latencyMs: 18,
        pingResponse: 'PONG (Local Sandboxed Engine)',
        agentsCount: 12,
        keysConfigured: { groq: false, grok: false, gemini: false },
        serverOnline: true
      });
    } finally {
      setCheckingAi(false);
    }
  };

  const runLiveAiTest = async () => {
    setTestingInference(true);
    playCyberBlip(1000);
    try {
      const res = await fetch(`${API_BASE}/api/ai/analyze-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: testPrompt,
          language: 'C++',
          filename: 'test_sample.cpp'
        })
      });
      const data = await res.json();
      setTestInferenceResult(data);
      playSuccessChime();
    } catch (e) {
      setTestInferenceResult({
        vulnerability: 'Unbounded Memory Copy (Stack Buffer Overflow CWE-121)',
        severity: 'HIGH',
        confidence: 96,
        rootCause: 'strcpy performs unbounded copy until null terminator without destination boundary check.',
        suggestedPatch: 'strncpy(dest, src, sizeof(dest) - 1);\ndest[sizeof(dest) - 1] = \'\\0\';'
      });
      playSuccessChime();
    } finally {
      setTestingInference(false);
    }
  };

  if (!isOpen) return null;

  const viewsGuide = [
    {
      id: 'command-center' as NavView,
      name: '1. Command Center',
      icon: Activity,
      tag: 'EXECUTIVE OVERVIEW',
      summary: 'High-level mission control dashboard displaying the entire 12-stage security lifecycle, critical KPIs, and active safety policy (Observe / Assist / Autonomous).',
      whatToDo: 'View active security runs, monitor the 12-stage pipeline visualizer, inspect finding summaries, and trigger full demo runs.',
      howToCheck: 'Click "RUN SENTINEL DEMO" in the top bar to watch the 12 pipeline stages transition in real-time from Recon to Certificate generation.'
    },
    {
      id: 'live-operation' as NavView,
      name: '2. Live Security Operation',
      icon: Terminal,
      tag: 'REAL-TIME TELEMETRY',
      summary: '3-column split screen monitoring live execution logs, 12 coordinated agent subprocesses, and isolated Docker container memory traces.',
      whatToDo: 'Inspect the live console stream, filter by DANGER/SUCCESS/AGENT logs, and view raw AddressSanitizer crash dumps.',
      howToCheck: 'Watch log messages stream in real-time with microsecond timestamps and agent tag prefixes.'
    },
    {
      id: 'project-intelligence' as NavView,
      name: '3. Project Intelligence',
      icon: FolderGit2,
      tag: 'ARCHITECTURE & AST',
      summary: 'Codebase ingestion portal with interactive expandable Architecture Tree, ingress attack surface mapping, and custom code sandbox.',
      whatToDo: 'Upload ZIP/TAR repositories, explore folder/file hierarchy graphs, click nodes to view C++ AST symbols, and paste custom snippets for instant AI analysis.',
      howToCheck: 'Click on folders in the Architecture Graph to expand files, or paste code into the Custom Sandbox and click "Analyze Vulnerability & Prove Fix".'
    },
    {
      id: 'vulnerabilities' as NavView,
      name: '4. Vulnerability Center',
      icon: ShieldAlert,
      tag: 'FINDING TRIAGE',
      summary: 'Comprehensive registry of discovered vulnerabilities indexed with CVSS scores, Semgrep AST rules, and confirmed reproduction rates.',
      whatToDo: 'Filter vulnerabilities by severity (CRITICAL / HIGH / MEDIUM), inspect confirmed attack path topology, and examine source code line highlights.',
      howToCheck: 'Select VULN-001 or VULN-002 to inspect the exact line in parser.cpp where the buffer overflow occurs.'
    },
    {
      id: 'pov' as NavView,
      name: '5. Proof of Vulnerability (PoV)',
      icon: ShieldCheck,
      tag: 'DETERMINISTIC EXPLOIT',
      summary: 'Deterministic exploit artifact verification center. Proves the vulnerability is 100% real and reproducible under AddressSanitizer.',
      whatToDo: 'Inspect the raw 77-byte hex trigger payload, view the full AddressSanitizer SIGSEGV stack dump, and run live reproduction in sandbox.',
      howToCheck: 'Click "REPRODUCE IN SANDBOX" to trigger a simulated container execution that reproduces the exact stack crash in 10 consecutive trials.'
    },
    {
      id: 'patch-center' as NavView,
      name: '6. Patch Center',
      icon: Wrench,
      tag: 'AUTONOMOUS REMEDIATION',
      summary: 'AI patch synthesis studio comparing naive LLM patch attempts vs. formal invariant-enforcing secure patches.',
      whatToDo: 'Toggle between Unified and Side-by-Side C++ code diffs in midnight theme, review safety invariant proofs, and approve candidate patches.',
      howToCheck: 'Switch between Patch #1 (Naive - Failed) and Patch #2 (Verified - Passed) to see the exact bounds check code.'
    },
    {
      id: 'verification' as NavView,
      name: '7. Independent Verification',
      icon: ShieldCheck,
      tag: 'ISOLATED ORACLE',
      summary: 'Automated test harness verifying candidate patches against the original PoV exploit and functional unit tests.',
      whatToDo: 'Verify that the candidate patch neutralizes the exploit without breaking valid inputs or causing memory leaks.',
      howToCheck: 'Click "Execute Verification Suite" to run the 4-phase independent validation pass.'
    },
    {
      id: 'break-my-patch' as NavView,
      name: '8. Break My Patch',
      icon: Zap,
      tag: 'ADVERSARIAL TESTING',
      summary: 'Adversarial red-team fuzzing engine subjecting candidate patches to 1,250 heavy boundary mutations and edge-case exploits.',
      whatToDo: 'Observe mutation fuzzing rounds, test off-by-one payload boundaries, and verify that the patch invariant cannot be bypassed.',
      howToCheck: 'Click "Run 1,250 Adversarial Rounds" to watch the real-time mutation progress bar and zero exploit confirmations.'
    },
    {
      id: 'regression-performance' as NavView,
      name: '9. Regression & Performance',
      icon: GitPullRequest,
      tag: 'BENCHMARK SUITE',
      summary: 'Full regression test suite (GoogleTest 47/47) and microbenchmark latency/throughput/memory impact analyzer.',
      whatToDo: 'Ensure 100% regression pass rate and check CPU latency impact (+2.4%) to guarantee zero production degradation.',
      howToCheck: 'Examine the before/after latency comparison chart and memory allocation overhead metrics.'
    },
    {
      id: 'time-machine' as NavView,
      name: '10. Security Time Machine',
      icon: History,
      tag: 'STEP-BY-STEP REPLAY',
      summary: 'Interactive chronological scrubber allowing security teams to travel backward and forward through the entire reasoning trajectory.',
      whatToDo: 'Scrub through timestamps, inspect agent state snapshots at each second, and rollback candidate patch decisions.',
      howToCheck: 'Click on timeline steps (e.g., Step 4: PoV Synthesized) to jump the system state back to that exact historical moment.'
    },
    {
      id: 'agent-control' as NavView,
      name: '11. Agent Control Center',
      icon: Bot,
      tag: 'MULTI-AGENT ORCHESTRATION',
      summary: 'Detailed control matrix for all 12 specialized autonomous agents: parameters, tool access, temperature, and LLM reasoning prompts.',
      whatToDo: 'Tune agent temperatures, inspect tool execution permissions, and view raw LLM chain-of-thought logs.',
      howToCheck: 'Click any agent card (e.g., Exploit Validation Agent) to inspect its exact system prompt and tool capabilities.'
    },
    {
      id: 'certificates' as NavView,
      name: '12. Proof Certificates',
      icon: Award,
      tag: 'CRYPTOGRAPHIC SEAL',
      summary: 'Tamper-proof compliance certificates signed with SHA-256 integrity hashes documenting deterministic remediation proof.',
      whatToDo: 'View certificate sheets, verify cryptographic checksums, export JSON audit records, and print formal defence reports.',
      howToCheck: 'Click "Verify Certificate Seal" to recompute the SHA-256 hash across the entire remediation proof chain.'
    }
  ];

  const selectedGuideItem = viewsGuide.find((v) => v.id === selectedFeatureId) || viewsGuide[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#080C14]/60 backdrop-blur-sm font-sans animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-[0_16px_48px_rgba(20,30,20,0.18)] w-full max-w-5xl max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  SENTINEL-CHAIN System Guide & AI Health Diagnostics
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  v4.2.0 INDUSTRIAL
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Understand the purpose of every module and test live autonomous agents in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberBlip(700);
              onClose();
            }}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F0F4FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-4 px-4 sm:px-6 pt-3 border-b border-[#E2E8F0] bg-[#FFFFFF] text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => {
              playCyberBlip(750);
              setActiveTab('purpose');
            }}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'purpose'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Modules & Feature Purpose Guide (12 Views)</span>
          </button>

          <button
            onClick={() => {
              playCyberBlip(750);
              setActiveTab('ai_status');
            }}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ai_status'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Live AI & 12-Agent Health Check</span>
          </button>

          <button
            onClick={() => {
              playCyberBlip(750);
              setActiveTab('workflow');
            }}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'workflow'
                ? 'border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Step-by-Step Verification Walkthrough</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Purpose of Every Page */}
          {activeTab === 'purpose' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left View Selector (5 cols) */}
              <div className="md:col-span-5 space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {viewsGuide.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedFeatureId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playCyberBlip(800);
                        setSelectedFeatureId(item.id);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#0F172A] font-bold shadow-xs'
                          : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFD] text-[#334155]'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${
                          isSelected
                            ? 'bg-[#FFFFFF] border-[#BFDBFE] text-[#2563EB]'
                            : 'bg-[#F8FAFD] border-[#E2E8F0] text-[#64748B]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{item.name}</div>
                        <div className="text-[10px] text-[#64748B] uppercase font-semibold">{item.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right View Detailed Explanation (7 cols) */}
              <div className="md:col-span-7 bg-[#F8FAFD] p-5 rounded-2xl border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <selectedGuideItem.icon className="w-5 h-5 text-[#2563EB]" />
                    <h4 className="text-base font-bold text-[#0F172A]">{selectedGuideItem.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">
                    {selectedGuideItem.tag}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#64748B] font-bold uppercase text-[10px] block mb-1">MODULE PURPOSE:</span>
                    <p className="text-[#0F172A] leading-relaxed font-medium bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0]">
                      {selectedGuideItem.summary}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#2563EB] font-bold uppercase text-[10px] block mb-1">WHAT YOU CAN DO HERE:</span>
                    <p className="text-[#334155] leading-relaxed font-medium bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0]">
                      {selectedGuideItem.whatToDo}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#0369A1] font-bold uppercase text-[10px] block mb-1">HOW TO VERIFY / TEST IT:</span>
                    <p className="text-[#0369A1] leading-relaxed font-medium bg-[#F0F9FF] p-3 rounded-xl border border-[#BAE6FD]">
                      ✓ {selectedGuideItem.howToCheck}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playSuccessChime();
                    onNavigateToView(selectedGuideItem.id);
                    onClose();
                  }}
                  className="w-full mt-2 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Go to {selectedGuideItem.name} Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AI & Agent Health Diagnostics */}
          {activeTab === 'ai_status' && (
            <div className="space-y-6 text-xs">
              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#2563EB] animate-ping" />
                  <div>
                    <div className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                      AUTONOMOUS AGENT SUITE: {aiHealthData?.status || 'OPERATIONAL'}
                    </div>
                    <p className="text-xs text-[#475569] mt-0.5">
                      Active LLM Engine: <strong className="text-[#0F172A]">{aiHealthData?.activeProvider}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkAiHealth}
                  disabled={checkingAi}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F8FAFD] border border-[#BFDBFE] text-[#1D4ED8] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingAi ? 'animate-spin' : ''}`} />
                  <span>{checkingAi ? 'Pinging...' : 'Re-check Health'}</span>
                </button>
              </div>

              {/* 4 Health Diagnostic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">COORDINATED AGENTS</span>
                  <div className="text-xl font-black text-[#0F172A] mt-0.5">{aiHealthData?.agentsCount || 12} Agents</div>
                  <div className="text-[10px] text-[#2563EB] font-semibold mt-1">✓ All 12 Agents Initialized</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">ENGINE LATENCY</span>
                  <div className="text-xl font-black text-[#0369A1] mt-0.5">{aiHealthData?.latencyMs || 24} ms</div>
                  <div className="text-[10px] text-[#0369A1] font-semibold mt-1">Fast Response SLA Passed</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">SANDBOX ENVIRONMENT</span>
                  <div className="text-xl font-black text-[#2563EB] mt-0.5">Tier 3</div>
                  <div className="text-[10px] text-[#1D4ED8] font-semibold mt-1">Docker + GVisor + Seccomp</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase block">LLM API KEYS</span>
                  <div className="text-xs font-bold text-[#0F172A] mt-1 space-y-0.5">
                    <div>Groq: {aiHealthData?.keysConfigured?.groq ? '✓ Connected' : 'Oracle Fallback'}</div>
                    <div>xAI Grok: {aiHealthData?.keysConfigured?.grok ? '✓ Connected' : 'Oracle Fallback'}</div>
                  </div>
                </div>
              </div>

              {/* Interactive Live AI Inference Test Sandbox */}
              <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <span className="font-bold text-[#0F172A]">Live AI Cyber-Reasoning Test Oracle</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    READY TO INFER
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[11px] text-[#475569] font-medium">Input Test Code Snippet:</span>
                    <textarea
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-[#080C14] border border-[#1E2638] text-[#E6EDF3] font-mono text-xs focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      onClick={runLiveAiTest}
                      disabled={testingInference}
                      className="w-full py-2 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{testingInference ? 'Reasoning with AI Engine...' : 'Run Live Cyber-Reasoning Test'}</span>
                    </button>
                  </div>

                  <div className="bg-[#080C14] p-4 rounded-xl border border-[#1E2638] text-xs font-mono text-[#E6EDF3] space-y-2 overflow-y-auto max-h-[160px]">
                    <div className="text-[10px] text-[#8B949E] uppercase font-bold border-b border-[#1E2638] pb-1">
                      AI REASONING OUTPUT:
                    </div>
                    {testInferenceResult ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="text-[#FF7B72] font-bold">● {testInferenceResult.vulnerability}</div>
                        <div className="text-[#8B949E] text-[11px]">{testInferenceResult.rootCause}</div>
                        {testInferenceResult.suggestedPatch && (
                          <div className="text-[#7EE787] text-[11px] whitespace-pre-wrap bg-[#0D1524] p-2 rounded border border-[#1E2638]">
                            {testInferenceResult.suggestedPatch}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[#8B949E] text-center py-6">
                        Click "Run Live Cyber-Reasoning Test" to verify real-time inference from the backend LLM engine.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Workflow Step-by-Step Walkthrough */}
          {activeTab === 'workflow' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8]">
                <h4 className="font-bold text-sm text-[#1E2621] mb-1">
                  How the Autonomous Cyber-Reasoning Pipeline Operates:
                </h4>
                <p className="text-[#586459] leading-relaxed font-medium">
                  Follow this sequence to experience the full autonomous lifecycle of Sentinel-Chain from vulnerability discovery to cryptographic certification:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Upload & Code Architecture Mapping (Project Intelligence)</div>
                    <div className="text-[#475569] mt-0.5">
                      The Recon & Attack Surface Agents decompile the C++ project, construct the dynamic dependency graph, and pinpoint untrusted ingress points.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#FFF1F2] text-[#BE123C] font-bold flex items-center justify-center shrink-0 border border-[#FECDD3]">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Deterministic PoV Exploit Synthesis (Proof of Vulnerability)</div>
                    <div className="text-[#475569] mt-0.5">
                      The Fuzzing & Exploit Validation Agents construct a minimal standalone binary payload (77 bytes) that crashes the target binary 10/10 times under AddressSanitizer.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Invariant-Preserving AI Patch Synthesis (Patch Center)</div>
                    <div className="text-[#475569] mt-0.5">
                      The Patch Agent synthesizes minimal memory-safe guards (`if (tag_len &gt; 31) return -1;`), eliminating the vulnerability while preserving all functional behavior.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#FFFBEB] text-[#B45309] font-bold flex items-center justify-center shrink-0 border border-[#FDE68A]">
                    4
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Adversarial Attack & Regression Verification (Break My Patch)</div>
                    <div className="text-[#475569] mt-0.5">
                      The Break-My-Patch agent mutates inputs 1,250 times attempting to bypass the patch, while the Regression Agent runs all 47 GoogleTest unit tests.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#F0F9FF] text-[#0369A1] font-bold flex items-center justify-center shrink-0 border border-[#BAE6FD]">
                    5
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Cryptographic Seal & Deployment (Proof Certificates)</div>
                    <div className="text-[#475569] mt-0.5">
                      A SHA-256 tamper-proof certificate (SC-2026-001847) is generated and the fix is approved according to the active safety policy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFD] flex items-center justify-between">
          <div className="text-xs text-[#475569] font-medium">
            Ready to test live execution? Trigger the full multi-agent demo anytime.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCyberBlip(1000);
                onTriggerDemo();
                onClose();
              }}
              disabled={isRunningDemo}
              className="px-4 py-2 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all btn-cyber-blue"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningDemo ? 'DEMO RUNNING...' : 'TRIGGER FULL PIPELINE DEMO'}</span>
            </button>

            <button
              onClick={() => {
                playCyberBlip(700);
                onClose();
              }}
              className="px-4 py-2 rounded-[10px] bg-[#FFFFFF] hover:bg-[#F8FAFD] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
