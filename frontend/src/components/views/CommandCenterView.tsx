import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, ShieldAlert, ShieldCheck, Clock, Play, Terminal, Cpu,
  ArrowRight, Sparkles, Zap, FolderTree, ChevronRight, Award, Circle,
  CheckCircle2, ExternalLink
} from 'lucide-react';
import { SecurityRun, SafetyMode, NavView } from '../../types';
import { PipelineVisualizer } from '../PipelineVisualizer';
import { LogDetailModal, LogItemDetail } from '../LogDetailModal';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface CommandCenterViewProps {
  run: SecurityRun;
  safetyMode: SafetyMode;
  onNavigate: (view: NavView) => void;
  onTriggerDemo: () => void;
  isRunningDemo: boolean;
}

const LIVE_LOGS: LogItemDetail[] = [
  {
    type: 'AGENT',
    tag: 'RECON',
    message: 'Mapping attack surface... discovered 3 network entry points in src/network.cpp',
    agent: 'Recon & Attack Surface Agent',
    file: 'src/network.cpp',
    line: 118,
    details: 'Symbol table resolution completed. External raw socket descriptor feeds untrusted bytes into handle_incoming_connection.',
    relatedView: 'project-intelligence'
  },
  {
    type: 'INFO',
    tag: 'SYSTEM',
    message: 'Docker sandbox initialized — memory: 512MB, CPU: 2 cores, GVisor seccomp enabled',
    agent: 'Orchestration Kernel',
    details: 'Isolated ephemeral execution environment provisioned to execute fuzzing and dynamic exploit verification without host risk.'
  },
  {
    type: 'AGENT',
    tag: 'STATIC',
    message: 'Running Semgrep c.lang.security ruleset — 47 rules active across AST nodes',
    agent: 'Static Analysis Agent',
    file: 'src/parser.cpp',
    line: 142,
    details: 'AST search identifies dangerous pattern: strcpy into 64-byte stack destination without prior length validation.',
    relatedView: 'vulnerabilities'
  },
  {
    type: 'DANGER',
    tag: 'VULN',
    message: '⚠ CRITICAL: strcpy(buffer, input) at parser.cpp:142 — stack overflow vulnerability confirmed',
    agent: 'Static Analysis Agent',
    file: 'src/parser.cpp',
    line: 142,
    snippet: 'char buffer[64];\nstrcpy(buffer, input); // Memory smash',
    details: 'High-severity stack buffer overflow (CWE-121). Function return address overwritten when header exceeds 63 bytes.',
    relatedView: 'vulnerabilities'
  },
  {
    type: 'AGENT',
    tag: 'FUZZING',
    message: 'AFL++ corpus: 1,247 test cases — coverage: 84.3%, crash triggered after 4,812 execs',
    agent: 'Evolutionary Fuzzing Agent',
    file: 'tests/pov_crash_001.bin',
    details: 'Coverage-guided mutator synthesized 77-byte header triggering instantaneous AddressSanitizer SIGSEGV.',
    relatedView: 'vulnerabilities'
  },
  {
    type: 'SUCCESS',
    tag: 'POV',
    message: '✓ Exploit confirmed 10/10 — SIGSEGV triggered via standalone pov_crash_001.bin',
    agent: 'Exploit Validation Agent',
    file: 'tests/pov_crash_001.bin',
    payloadHex: '48 45 41 44 45 52 3a 20 41 41 41 41 41 41 41 41 ... 42 42 42 42 43 43 43 43 44 44 44 44 00',
    details: 'Deterministic Proof of Vulnerability (PoV) synthesized with 100% reproduction consistency across multiple runs.',
    relatedView: 'vulnerabilities'
  },
  {
    type: 'AGENT',
    tag: 'PATCH',
    message: 'Generating candidate patch #2 — applying formal length guard invariant',
    agent: 'Patch Synthesis Agent',
    file: 'src/parser.cpp',
    line: 140,
    snippet: 'if (input_len >= sizeof(buffer)) return ERROR_HEADER_TOO_LONG;\nmemcpy(buffer, input, input_len);\nbuffer[input_len] = "\\0";',
    details: 'Replaced naive strcpy with strict bounds check returning safe error code.',
    relatedView: 'patch-center'
  },
  {
    type: 'INFO',
    tag: 'COMPILER',
    message: 'g++ -O2 -fsanitize=address,undefined — build SUCCESS in 2.3s (0 errors)',
    agent: 'Compiler Verification Sandbox',
    file: 'src/parser.cpp',
    details: 'Clean compilation under AddressSanitizer and UndefinedBehaviorSanitizer instrumentation.',
    relatedView: 'patch-center'
  },
  {
    type: 'SUCCESS',
    tag: 'VERIFY',
    message: '✓ Original exploit BLOCKED — safe return code ERROR_HEADER_TOO_LONG confirmed',
    agent: 'Independent Verification Agent',
    details: 'Isolated oracle evaluated objective binary execution with zero LLM hallucination leakage. Verdict: PASS.',
    relatedView: 'patch-center'
  },
  {
    type: 'AGENT',
    tag: 'BREAK',
    message: 'Launching 1,250 adversarial mutation rounds across 6 attack vectors...',
    agent: 'Break My Patch Agent',
    details: 'Stress testing patch invariant against null-byte injection, integer wrapping, format strings, and off-by-one offsets.',
    relatedView: 'patch-center'
  },
  {
    type: 'SUCCESS',
    tag: 'REGRESSION',
    message: '✓ 47/47 GoogleTest suites PASSED — zero functional regressions',
    agent: 'Regression Agent',
    details: 'All benign functionality remains intact with 100% test pass rate.',
    relatedView: 'analytics'
  },
  {
    type: 'SUCCESS',
    tag: 'CERT',
    message: '✓ Certificate SC-2026-001847 issued — SHA-256 cryptographic seal applied',
    agent: 'Proof Certification Agent',
    details: 'Immutable audit trail published with cryptographic hash binding AST findings, PoV, patch diff, and verification logs.',
    relatedView: 'certificates'
  }
];

let logIdx = 0;

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  run, safetyMode, onNavigate, onTriggerDemo, isRunningDemo
}) => {
  const [displayedLogs, setDisplayedLogs] = useState<Array<LogItemDetail & { uid: number }>>([]);
  const [selectedLogForModal, setSelectedLogForModal] = useState<LogItemDetail | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const uidCounter = useRef(0);

  useEffect(() => {
    // Initialize with first 5 logs
    const initial = LIVE_LOGS.slice(0, 5).map((l) => ({
      ...l,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      uid: uidCounter.current++
    }));
    setDisplayedLogs(initial);

    const interval = setInterval(() => {
      const entry = LIVE_LOGS[logIdx % LIVE_LOGS.length];
      logIdx++;
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      setDisplayedLogs((prev) => [{ ...entry, time, uid: uidCounter.current++ }, ...prev].slice(0, 40));
    }, isRunningDemo ? 1000 : 2500);

    return () => clearInterval(interval);
  }, [isRunningDemo]);

  const metricCards = [
    {
      id: 'active-runs', title: 'ACTIVE RUNS', value: '03',
      subtext: 'Autonomous Docker Sandboxes', icon: Activity,
      textColor: 'text-[#1E40AF]', iconBg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
      tag: 'LIVE', tagColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      clickView: 'live-operation' as NavView,
    },
    {
      id: 'confirmed-vulns', title: 'CONFIRMED VULNS', value: `0${run.findings.length}`,
      subtext: 'PoV Synthesized & Reproducible', icon: ShieldAlert,
      textColor: 'text-[#E11D48]', iconBg: 'bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]',
      tag: 'ACTION REQ', tagColor: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
      clickView: 'vulnerabilities' as NavView,
    },
    {
      id: 'verified-patches', title: 'VERIFIED PATCHES', value: '02',
      subtext: 'Zero Regressions, 100% Invariant', icon: ShieldCheck,
      textColor: 'text-[#2563EB]', iconBg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      tag: 'VERIFIED', tagColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      clickView: 'patch-center' as NavView,
    },
    {
      id: 'pending-approvals', title: 'PENDING APPROVALS', value: '02',
      subtext: `Policy: ${safetyMode} Mode`, icon: Clock,
      textColor: 'text-[#B45309]', iconBg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
      tag: 'HUMAN GATE', tagColor: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      clickView: 'agent-control' as NavView,
    }
  ];

  const completedStages = run.stages.filter((s) => s.status === 'success').length;
  const progressPct = Math.round((completedStages / run.stages.length) * 100);

  const handleLogClick = (log: LogItemDetail) => {
    playCyberBlip(900);
    setSelectedLogForModal(log);
  };

  return (
    <div id="command-center-view" className="space-y-5 font-sans">
      {/* Log Detail Inspector Modal */}
      <LogDetailModal
        log={selectedLogForModal}
        onClose={() => setSelectedLogForModal(null)}
        onNavigate={onNavigate}
      />

      {/* Hero Banner */}
      <div className="p-6 sm:p-7 border border-[#E2E8F0] shadow-sm relative overflow-hidden rounded-2xl glass-panel">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] tracking-wider uppercase mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping" />
              <span>Autonomous Cyber-Reasoning Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              <span className="text-shine-cobalt">Cyber Sentinel</span> Command Center
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-1.5 max-w-2xl font-medium leading-relaxed">
              End-to-end multi-agent security pipeline: autonomous reconnaissance, deterministic exploit proof synthesis, verified patch remediation, and mathematical adversarial testing.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] shadow-sm">
              <div className="text-[10px] text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pipeline Progress</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold mb-3">
                {['Find It', 'Prove It', 'Fix It', 'Attack It', 'Certify It'].map((step, i) => (
                  <React.Fragment key={step}>
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">{step}</span>
                    {i < 4 && <span className="text-[#64748B]">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#2563EB] shrink-0">{progressPct}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                playCyberBlip(1100);
                onTriggerDemo();
              }}
              disabled={isRunningDemo}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm btn-cyber-blue ${
                isRunningDemo ? 'opacity-80 cursor-wait' : 'active:scale-95'
              }`}
            >
              {isRunningDemo ? (
                <><span className="w-2 h-2 rounded-full bg-white/80 animate-ping" /><span>PIPELINE RUNNING...</span></>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /><span>RUN FULL SENTINEL PIPELINE</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards — clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              id={`metric-card-${card.id}`}
              onClick={() => {
                playCyberBlip(850);
                onNavigate(card.clickView);
              }}
              className="p-5 rounded-2xl bg-[#FFFFFF] text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-[#E2E8F0] hover:border-[#93C5FD] shadow-sm group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[#475569] tracking-wider uppercase">{card.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${card.tagColor}`}>{card.tag}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-4xl font-extrabold ${card.textColor}`}>{card.value}</div>
                <div className={`p-3 rounded-xl border shadow-sm ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] text-xs text-[#475569] flex items-center justify-between">
                <span className="font-medium truncate">{card.subtext}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Pipeline Visualizer & Live Clickable Terminal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Current Operation */}
        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Current Security Operation</h3>
                <p className="text-[10px] text-[#475569] font-mono">{run.runId}</p>
              </div>
            </div>
            <button
              onClick={() => {
                playCyberBlip(900);
                onNavigate('live-operation');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-all active:scale-95"
            >
              <span>Live Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mb-3 text-xs text-[#475569]">
            Target: <strong className="text-[#0F172A]">{run.projectName}</strong> ·
            Lang: <span className="text-[#2563EB] font-semibold"> {run.projectProfile.language}</span> ·
            Build: <span className="text-[#334155]"> {run.projectProfile.buildSystem}</span>
          </div>

          <div className="bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-3">
            <PipelineVisualizer
              stages={run.stages}
              currentStageId={run.currentStage}
              onSelectStage={(stageId) => {
                if (['upload', 'recon', 'attack_surface'].includes(stageId)) onNavigate('project-intelligence');
                else if (stageId === 'static_analysis') onNavigate('vulnerabilities');
                else if (['fuzzing', 'pov'].includes(stageId)) onNavigate('vulnerabilities');
                else if (stageId === 'patch') onNavigate('patch-center');
                else if (stageId === 'verify') onNavigate('patch-center');
                else if (stageId === 'break_my_patch') onNavigate('patch-center');
                else if (['regression', 'performance'].includes(stageId)) onNavigate('analytics');
                else if (stageId === 'certificate') onNavigate('certificates');
              }}
            />
          </div>

          {/* Quick Action Row */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => {
                playCyberBlip(850);
                onNavigate('vulnerabilities');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-bold hover:bg-[#FECDD3] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Inspect Vulns</span>
            </button>
            <button
              onClick={() => {
                playCyberBlip(850);
                onNavigate('patch-center');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold hover:bg-[#DBEAFE] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Patch Workbench</span>
            </button>
            <button
              onClick={() => {
                playCyberBlip(850);
                onNavigate('certificates');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-bold hover:bg-[#DCFCE7] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificates</span>
            </button>
          </div>
        </div>

        {/* Live Clickable Terminal */}
        <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#080C14]">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              </div>
              <Terminal className="w-3.5 h-3.5 text-[#3B82F6] ml-1" />
              <span className="text-xs font-bold text-[#94A3B8] font-mono tracking-wider">SENTINEL LIVE FEED</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#475569]">
              <span className={`w-2 h-2 rounded-full ${isRunningDemo ? 'bg-[#22C55E] animate-pulse' : 'bg-[#3B82F6]'}`} />
              <span>CLICK ANY LOG TO INSPECT</span>
            </div>
          </div>

          <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {displayedLogs.map((log) => {
              const colorMap: Record<string, string> = {
                INFO: 'text-[#60A5FA]',
                AGENT: 'text-[#34D399]',
                WARN: 'text-[#FBBF24]',
                DANGER: 'text-[#F87171]',
                SUCCESS: 'text-[#4ADE80]',
              };
              const tagBg: Record<string, string> = {
                INFO: 'bg-blue-900/40 text-blue-300',
                AGENT: 'bg-emerald-900/40 text-emerald-300',
                WARN: 'bg-yellow-900/40 text-yellow-300',
                DANGER: 'bg-red-900/40 text-red-300',
                SUCCESS: 'bg-green-900/40 text-green-300',
              };

              return (
                <div
                  key={log.uid}
                  onClick={() => handleLogClick(log)}
                  className="flex items-start gap-2 font-mono text-[10px] leading-relaxed py-1 px-1.5 rounded hover:bg-[#1E293B] cursor-pointer transition-all animate-fade-in group"
                  title="Click to inspect complete log context"
                >
                  <span className="text-[#475569] shrink-0 w-14">{log.time}</span>
                  <span
                    className={`shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      tagBg[log.type || ''] || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {log.tag}
                  </span>
                  <span className={`${colorMap[log.type || ''] || 'text-[#94A3B8]'} break-words min-w-0 flex-1`}>
                    {log.message}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t border-[#1E293B] bg-[#080C14]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#475569]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                {displayedLogs.length} events streamed · Click to inspect
              </span>
              <button
                onClick={() => {
                  playCyberBlip(900);
                  onNavigate('live-operation');
                }}
                className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors flex items-center gap-1 font-bold"
              >
                Full Console <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Two Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Confirmed Vuln Card */}
        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E11D48]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Confirmed High-Risk Finding</h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
              CVSS 8.8 · HIGH
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#2563EB] font-bold text-sm">VULN-001 · Stack Buffer Overflow</span>
              <span className="text-[#475569] font-mono">src/parser.cpp:142</span>
            </div>
            <p className="text-[#334155] leading-relaxed font-medium">
              Unchecked string copy into 64-byte stack allocation smashes return address pointer. AddressSanitizer SIGSEGV confirmed in guided fuzzing.
            </p>
            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] overflow-x-auto">
              <div className="text-[#64748B] uppercase text-[9px] mb-1 font-bold">PROVEN ATTACK VECTOR</div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] min-w-max">
                <span className="text-[#2563EB] font-bold">TCP Socket</span>
                <span>→</span><span>parse_header_tag</span>
                <span>→</span><span className="text-[#BE123C] font-bold">strcpy(buffer, input)</span>
                <span>→</span><span className="text-[#E11D48] font-bold">SIGSEGV</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-[#1D4ED8] flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Patch #2 Verified (100% Invariant)</span>
              </div>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('vulnerabilities');
                }}
                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 active:scale-95"
              >
                Inspect Finding <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Proof Certificate Card */}
        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Cryptographic Remediation Seal</h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              VERIFIED PASS
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#475569]">Certificate ID:</span>
              <span className="text-[#2563EB] font-bold font-mono">SC-2026-001847</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'ORIGINAL POV RE-TEST', value: 'BLOCKED ✓', color: 'text-[#1D4ED8]' },
                { label: 'BREAK MY PATCH', value: '0 Exploits / 1,250', color: 'text-[#1D4ED8]' },
                { label: 'REGRESSION SUITE', value: '47 / 47 Passed', color: 'text-[#1D4ED8]' },
                { label: 'PERF IMPACT', value: '+2.4% (Within SLA)', color: 'text-[#2563EB]' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[9px] font-bold">{item.label}</span>
                  <span className={`${item.color} font-bold text-xs`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#64748B] font-mono truncate max-w-[200px]">
                SHA-256: e3b0c44298fc1c149af...
              </span>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('certificates');
                }}
                className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1 active:scale-95"
              >
                View Certificate <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Security Notifications & Actionable Alert Center */}
      <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-ping" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Live Security Telemetry & Notification Center
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            CLICK ANY ALERT TO JUMP DIRECTLY TO REMEDIATION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[
            {
              id: 'notif-1',
              type: 'DANGER',
              title: 'VULN-001 (Stack Buffer Overflow) Confirmed',
              desc: 'Deterministic SIGSEGV reproduced via tests/pov_crash_001.bin.',
              target: 'vulnerabilities' as NavView,
              badge: 'POV REPRODUCED',
              badgeColor: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
            },
            {
              id: 'notif-2',
              type: 'SUCCESS',
              title: 'Candidate Patch #2 Passed 1,250 Mutations',
              desc: 'Adversarial mutational fuzzing completed with 0 exploit bypasses.',
              target: 'patch-center' as NavView,
              badge: 'VERIFIED RESILIENT',
              badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
            },
            {
              id: 'notif-3',
              type: 'INFO',
              title: 'Proof Certificate SC-2026-001847 Minted',
              desc: 'Immutable SHA-256 cryptographic seal applied to remediation ledger.',
              target: 'certificates' as NavView,
              badge: 'SEALED & VALIDATED',
              badgeColor: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
            },
            {
              id: 'notif-4',
              type: 'DANGER',
              title: 'VULN-003: Use-After-Free in Session Table',
              desc: 'Dangling session pointer at session_manager.cpp:204 detected.',
              target: 'vulnerabilities' as NavView,
              badge: 'CRITICAL CWE-416',
              badgeColor: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
            },
            {
              id: 'notif-5',
              type: 'SUCCESS',
              title: 'GoogleTest: 78 / 78 Test Cases Passed',
              desc: 'All 10 regression test suites executed cleanly in isolated sandbox.',
              target: 'analytics' as NavView,
              badge: '0 REGRESSIONS',
              badgeColor: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
            },
            {
              id: 'notif-6',
              type: 'INFO',
              title: '12 Autonomous Agents Active',
              desc: 'All distributed cyber reasoning agents synchronized on pipeline.',
              target: 'agent-control' as NavView,
              badge: '12 / 12 BROADCASTING',
              badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playCyberBlip(950);
                onNavigate(item.target);
              }}
              className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] hover:bg-[#EFF6FF] hover:border-[#93C5FD] transition-all cursor-pointer space-y-1.5 text-left group active:scale-[0.98] shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] font-bold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <h5 className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                {item.title}
              </h5>
              <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
