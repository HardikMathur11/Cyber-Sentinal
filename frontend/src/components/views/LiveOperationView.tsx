import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Terminal, ShieldAlert, Cpu, Search, Wrench, ShieldCheck,
  Zap, GitPullRequest, Award, Compass, Flame, CheckCircle2,
  Play, RotateCcw, Bot, Filter, ChevronRight, Circle, ArrowRight
} from 'lucide-react';
import { SecurityRun, AgentInfo, ConsoleLogMessage } from '../../types';
import { LogDetailModal, LogItemDetail } from '../LogDetailModal';
import { playCyberBlip, playAlertSound } from '../../utils/audio';

interface LiveOperationViewProps {
  run: SecurityRun;
  isRunningDemo: boolean;
  onTriggerDemo: () => void;
  onNavigate: (view: any) => void;
}

// Dummy live log generator
const LIVE_LOG_POOL: Omit<ConsoleLogMessage, 'id' | 'time'>[] = [
  { type: 'AGENT', tag: 'RECON', message: 'Mapping attack surface... discovered 3 network entry points' },
  { type: 'INFO', tag: 'SYSTEM', message: 'Docker sandbox initialized — memory: 512MB, CPU: 2 cores' },
  { type: 'AGENT', tag: 'STATIC-ANALYSIS', message: 'Running Semgrep ruleset: c.lang.security.insecure-use-strcpy.c' },
  { type: 'DANGER', tag: 'VULN', message: '⚠ CRITICAL: strcpy(buffer, input) at parser.cpp:142 — stack overflow risk' },
  { type: 'AGENT', tag: 'FUZZING', message: 'AFL++ corpus: 1,247 test cases generated — coverage: 84.3%' },
  { type: 'SUCCESS', tag: 'POV', message: '✓ Exploit confirmed 10/10 — SIGSEGV triggered via TCP input' },
  { type: 'AGENT', tag: 'PATCH-AGENT', message: 'Generating candidate patch #1 — applying bounds check on strcpy' },
  { type: 'INFO', tag: 'COMPILER', message: 'g++ -O2 -fsanitize=address — build SUCCESS in 2.3s' },
  { type: 'AGENT', tag: 'VERIFY', message: 'Re-running original PoV payload against patched binary...' },
  { type: 'SUCCESS', tag: 'VERIFY', message: '✓ Original exploit BLOCKED — safe return confirmed' },
  { type: 'AGENT', tag: 'BREAK-MY-PATCH', message: 'Launching 1,250 adversarial mutation rounds...' },
  { type: 'INFO', tag: 'BREAK-MY-PATCH', message: 'Mutation round 312/1250 — no bypass detected' },
  { type: 'AGENT', tag: 'REGRESSION', message: 'Running GoogleTest harness — 47 test cases queued' },
  { type: 'SUCCESS', tag: 'REGRESSION', message: '✓ 47/47 tests passed — zero regressions introduced' },
  { type: 'AGENT', tag: 'PERF', message: 'Benchmarking latency delta — baseline: 1.82ms, patched: 1.86ms' },
  { type: 'SUCCESS', tag: 'CERT', message: '✓ Proof Certificate SC-2026-001847 issued — SHA-256 sealed' },
  { type: 'INFO', tag: 'ORCHESTRATOR', message: 'Pipeline stage transition: patch → verify' },
  { type: 'AGENT', tag: 'ATTACK-SURFACE', message: 'Analyzing taint flow: TCP Socket → parse_header_tag → strcpy' },
  { type: 'WARN', tag: 'SYSTEM', message: 'Sandbox memory usage at 78% — monitoring...' },
  { type: 'SUCCESS', tag: 'FUZZING', message: '✓ Crash reproducer saved: crash_input_0x4a2f.bin (17 bytes)' },
];

let logIdCounter = 1000;
function generateLiveLog(): ConsoleLogMessage {
  const template = LIVE_LOG_POOL[Math.floor(Math.random() * LIVE_LOG_POOL.length)];
  return {
    ...template,
    id: `live-${logIdCounter++}`,
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}

const STAGE_LABELS: Record<string, string> = {
  upload: 'Upload & Recon',
  recon: 'Reconnaissance',
  attack_surface: 'Attack Surface',
  static_analysis: 'Static Analysis',
  fuzzing: 'Fuzzing',
  pov: 'Proof of Vuln',
  patch: 'Patch Gen',
  verify: 'Verification',
  break_my_patch: 'Break My Patch',
  regression: 'Regression',
  performance: 'Performance',
  certificate: 'Certificate',
};

const getAgentIcon = (id: string) => {
  const icons: Record<string, React.ElementType> = {
    'recon-agent': Compass,
    'attack-surface-agent': ShieldAlert,
    'threat-analysis-agent': Flame,
    'static-analysis-agent': Search,
    'fuzzing-agent': Cpu,
    'exploit-validation-agent': CheckCircle2,
    'patch-agent': Wrench,
    'verification-agent': ShieldCheck,
    'break-my-patch-agent': Zap,
    'regression-agent': GitPullRequest,
    'performance-agent': Activity,
    'proof-agent': Award,
  };
  return icons[id] || Bot;
};

const LogLine: React.FC<{ log: ConsoleLogMessage }> = ({ log }) => {
  const colorMap: Record<string, string> = {
    INFO: 'text-[#60A5FA]',
    AGENT: 'text-[#34D399]',
    WARN: 'text-[#FBBF24]',
    DANGER: 'text-[#F87171]',
    SUCCESS: 'text-[#4ADE80]',
    SYSTEM: 'text-[#94A3B8]',
  };
  const tagBg: Record<string, string> = {
    INFO: 'bg-blue-900/40 text-blue-300',
    AGENT: 'bg-emerald-900/40 text-emerald-300',
    WARN: 'bg-yellow-900/40 text-yellow-300',
    DANGER: 'bg-red-900/40 text-red-300',
    SUCCESS: 'bg-green-900/40 text-green-300',
    SYSTEM: 'bg-slate-800 text-slate-400',
  };
  return (
    <div className="flex items-start gap-2 font-mono text-[11px] leading-relaxed py-0.5 hover:bg-white/5 px-1 rounded">
      <span className="text-[#475569] shrink-0 w-16">{log.time}</span>
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${tagBg[log.type] || tagBg.SYSTEM}`}>{log.tag}</span>
      <span className={`${colorMap[log.type] || 'text-[#94A3B8]'} break-words min-w-0`}>{log.message}</span>
    </div>
  );
};

export const LiveOperationView: React.FC<LiveOperationViewProps> = ({ run, isRunningDemo, onTriggerDemo, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents'>('pipeline');
  const [liveLogs, setLiveLogs] = useState<ConsoleLogMessage[]>(() => run.logs.slice(0, 20));
  const [logFilter, setLogFilter] = useState<'ALL' | 'AGENT' | 'DANGER' | 'SUCCESS'>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(run.agents[0]?.id || '');
  const [selectedLogForModal, setSelectedLogForModal] = useState<LogItemDetail | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Stream live logs continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLogs(prev => {
        const newLog = generateLiveLog();
        const next = [newLog, ...prev].slice(0, 120);
        return next;
      });
    }, isRunningDemo ? 800 : 2400);
    return () => clearInterval(interval);
  }, [isRunningDemo]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [liveLogs]);

  const filteredLogs = liveLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  const selectedAgent = run.agents.find(a => a.id === selectedAgentId) || run.agents[0];
  const completedStages = run.stages.filter(s => s.status === 'success').length;
  const totalStages = run.stages.length;
  const progressPct = Math.round((completedStages / totalStages) * 100);

  return (
    <div id="live-operation-view" className="space-y-4 font-sans">
      {/* Log Detail Inspector Modal */}
      <LogDetailModal
        log={selectedLogForModal}
        onClose={() => setSelectedLogForModal(null)}
        onNavigate={onNavigate}
      />

      {/* Top Status Bar */}
      <div className="bg-[#FFFFFF] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${isRunningDemo ? 'bg-[#2563EB] animate-ping' : 'bg-[#22C55E]'}`} />
          <div>
            <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              LIVE SECURITY OPERATION
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isRunningDemo ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] animate-pulse' : 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'}`}>
                {isRunningDemo ? '● PIPELINE ACTIVE' : '● STANDBY'}
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Run: <span className="font-mono text-[#2563EB]">{run.runId}</span> · Target: <strong className="text-[#0F172A]">{run.projectName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pipeline Progress */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">{completedStages}/{totalStages} Stages</span>
            <div className="w-32 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => { playCyberBlip(1100); onTriggerDemo(); }}
            disabled={isRunningDemo}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isRunningDemo ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait' : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-95'
            }`}
          >
            {isRunningDemo ? (
              <><span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" /><span>RUNNING...</span></>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /><span>START PIPELINE</span></>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-1 w-fit">
        {[
          { id: 'pipeline', label: 'Pipeline & Logs', icon: Terminal },
          { id: 'agents', label: 'Agent Status', icon: Bot },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { playCyberBlip(800); setActiveTab(tab.id as any); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                active ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Pipeline Stage List */}
          <div className="xl:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">12-Stage Pipeline</h3>
            </div>
            <div className="space-y-1.5">
              {run.stages.map((stage, idx) => {
                const statusColor = {
                  success: 'text-[#22C55E]',
                  running: 'text-[#2563EB] animate-pulse',
                  waiting: 'text-[#CBD5E1]',
                  failed: 'text-[#EF4444]',
                  warning: 'text-[#F59E0B]',
                }[stage.status];
                const bgColor = {
                  success: 'bg-[#F0FDF4] border-[#BBF7D0]',
                  running: 'bg-[#EFF6FF] border-[#2563EB] shadow-[0_0_12px_rgba(37,99,235,0.15)]',
                  waiting: 'bg-[#F8FAFD] border-[#E2E8F0]',
                  failed: 'bg-[#FFF1F2] border-[#FECDD3]',
                  warning: 'bg-[#FFFBEB] border-[#FDE68A]',
                }[stage.status];
                return (
                  <div key={stage.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-xs ${bgColor}`}>
                    <span className="w-4 text-[10px] font-mono text-[#94A3B8] shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <Circle className={`w-2.5 h-2.5 shrink-0 fill-current ${statusColor}`} />
                    <span className={`flex-1 font-semibold truncate ${stage.status === 'waiting' ? 'text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                      {STAGE_LABELS[stage.id] || stage.name}
                    </span>
                    {stage.status === 'running' && (
                      <span className="text-[10px] font-bold text-[#2563EB] animate-pulse">LIVE</span>
                    )}
                    {stage.status === 'success' && (
                      <span className="text-[10px] font-bold text-[#16A34A]">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Terminal */}
          <div className="xl:col-span-3 bg-[#0B0F19] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#080C14]">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#E2E8F0] font-mono uppercase tracking-wider">Live Agent Terminal</span>
                <span className={`w-2 h-2 rounded-full ${isRunningDemo ? 'bg-[#22C55E] animate-pulse' : 'bg-[#3B82F6]'}`} />
              </div>
              <div className="flex items-center gap-1">
                {(['ALL', 'AGENT', 'DANGER', 'SUCCESS'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      logFilter === f ? 'bg-[#2563EB] text-white' : 'text-[#475569] hover:text-[#94A3B8]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 space-y-0 min-h-[380px] max-h-[460px] custom-scrollbar">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  onClick={() => {
                    playCyberBlip(900);
                    setSelectedLogForModal({
                      id: log.id,
                      time: log.time,
                      type: log.type,
                      tag: log.tag,
                      message: log.message,
                      agent: log.tag || 'Autonomous Agent',
                      file: log.message.includes('parser.cpp') ? 'src/parser.cpp' : log.message.includes('network.cpp') ? 'src/network.cpp' : 'src/main.cpp',
                      details: `Event produced during live security run ${run.runId}. Automated agent telemetry verified under sandbox isolation.`,
                      relatedView: log.tag === 'VULN' || log.tag === 'POV' ? 'vulnerabilities' : log.tag === 'PATCH' || log.tag === 'VERIFY' || log.tag === 'BREAK-MY-PATCH' ? 'patch-center' : log.tag === 'CERT' ? 'certificates' : 'analytics'
                    });
                  }}
                  className="cursor-pointer hover:bg-white/10 rounded transition-all group"
                  title="Click to inspect event details"
                >
                  <LogLine log={log} />
                </div>
              ))}{filteredLogs.length === 0 && (
                <div className="text-[#475569] text-xs font-mono p-4 text-center">No {logFilter.toLowerCase()} logs yet...</div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-[#1E293B] bg-[#080C14] flex items-center gap-2 text-[10px] font-mono text-[#475569]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>{filteredLogs.length} events · Auto-streaming · Sentinel Engine</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Agent Grid */}
          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {run.agents.map(agent => {
              const Icon = getAgentIcon(agent.id);
              const isSelected = selectedAgentId === agent.id;
              const isRunning = agent.status === 'RUNNING';
              return (
                <div
                  key={agent.id}
                  onClick={() => { playCyberBlip(800); setSelectedAgentId(agent.id); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF]/60 ring-1 ring-[#2563EB]/30 shadow-sm'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#93C5FD] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRunning ? 'bg-[#EFF6FF] border border-[#2563EB]' : 'bg-[#F8FAFD] border border-[#E2E8F0]'}`}>
                        <Icon className={`w-4 h-4 ${isRunning ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-[#0F172A] leading-tight">{agent.name}</h4>
                        <span className="text-[10px] text-[#64748B]">{agent.provider}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      agent.status === 'COMPLETED' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      : agent.status === 'RUNNING' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] animate-pulse'
                      : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                    }`}>{agent.status}</span>
                  </div>

                  <p className="text-[10px] text-[#475569] leading-relaxed line-clamp-2">{agent.role}</p>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-[#64748B] font-medium">{agent.currentTask}</span>
                      <span className="text-[9px] font-bold text-[#2563EB]">{agent.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isRunning ? 'bg-gradient-to-r from-[#2563EB] to-[#60A5FA]' : 'bg-[#2563EB]'}`}
                        style={{ width: `${agent.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.tools.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#F8FAFD] border border-[#E2E8F0] text-[#475569]">{t}</span>
                    ))}
                    {agent.tools.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F8FAFD] border border-[#E2E8F0] text-[#94A3B8]">+{agent.tools.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Agent Detail + Terminal */}
          <div className="xl:col-span-2 flex flex-col gap-3">
            {selectedAgent && (
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                  {(() => { const Icon = getAgentIcon(selectedAgent.id); return <Icon className="w-4 h-4 text-[#2563EB]" />; })()}
                  <h3 className="text-sm font-bold text-[#0F172A]">{selectedAgent.name}</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#64748B]">Status</span><span className="font-bold text-[#2563EB]">{selectedAgent.status}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Provider</span><span className="font-semibold text-[#0F172A]">{selectedAgent.provider}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Progress</span><span className="font-bold text-[#2563EB]">{selectedAgent.progressPercent}%</span></div>
                  {selectedAgent.activeFile && (
                    <div className="flex justify-between"><span className="text-[#64748B]">Active File</span><span className="font-mono text-[#0284C7] text-[10px]">{selectedAgent.activeFile}</span></div>
                  )}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[11px] text-[#334155] leading-relaxed">
                  {selectedAgent.summary}
                </div>
              </div>
            )}

            {/* Agent Log Terminal */}
            <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1E293B] bg-[#080C14]">
                <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-[11px] font-bold text-[#94A3B8] font-mono">Agent Stream</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse ml-auto" />
              </div>
              <div className="overflow-y-auto max-h-64 p-3 space-y-0 custom-scrollbar">
                {liveLogs.filter(l => l.tag === (selectedAgent?.name?.split(' ')[0]?.toUpperCase() || '') || Math.random() > 0.6).slice(0, 20).map(log => (
                  <LogLine key={log.id} log={log} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
