import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Terminal,
  ShieldAlert,
  Cpu,
  Search,
  Wrench,
  ShieldCheck,
  Zap,
  GitPullRequest,
  Award,
  Compass,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  FileCode,
  Binary,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { SecurityRun, AgentInfo, ConsoleLogMessage } from '../../types';
import { playCyberBlip, playAlertSound } from '../../utils/audio';

interface LiveOperationViewProps {
  run: SecurityRun;
  isRunningDemo: boolean;
  onTriggerDemo: () => void;
  onNavigate: (view: any) => void;
}

export const LiveOperationView: React.FC<LiveOperationViewProps> = ({
  run,
  isRunningDemo,
  onTriggerDemo,
  onNavigate
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('static-analysis-agent');
  const [logFilter, setLogFilter] = useState<'ALL' | 'AGENT' | 'DANGER' | 'SUCCESS'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [evidenceTab, setEvidenceTab] = useState<'asan' | 'pov-hex' | 'attack-path'>('asan');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [run.logs, autoScroll]);

  const filteredLogs = run.logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'recon-agent':
        return Compass;
      case 'attack-surface-agent':
        return ShieldAlert;
      case 'threat-analysis-agent':
        return Flame;
      case 'static-analysis-agent':
        return Search;
      case 'fuzzing-agent':
        return Cpu;
      case 'exploit-validation-agent':
        return CheckCircle2;
      case 'patch-agent':
        return Wrench;
      case 'verification-agent':
        return ShieldCheck;
      case 'break-my-patch-agent':
        return Zap;
      case 'regression-agent':
        return GitPullRequest;
      case 'performance-agent':
        return Activity;
      case 'proof-agent':
        return Award;
      default:
        return Cpu;
    }
  };

  const selectedAgent = run.agents.find((a) => a.id === selectedAgentId) || run.agents[3];

  return (
    <div id="live-operation-view" className="space-y-4 font-sans">
      {/* Top Controls & Status Bar */}
      <div className="bg-[#FFFFFF] p-4 flex flex-wrap items-center justify-between gap-3 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#43881E] animate-ping" />
          <div>
            <div className="text-xs font-bold text-[#1E2621] uppercase tracking-wider flex items-center gap-2">
              <span>Live Security Operation Monitor</span>
              <span className="text-[#2E7F8C] font-mono">[{run.runId}]</span>
            </div>
            <p className="text-xs text-[#586459] mt-0.5">
              Target: <strong className="text-[#1E2621]">{run.projectName}</strong> • 12 Coordinated Autonomous Agents • Docker Sandboxed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCyberBlip(1050);
              onTriggerDemo();
            }}
            disabled={isRunningDemo}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isRunningDemo
                ? 'bg-[#F1F8EC] border border-[#D1E7C4] text-[#377218] animate-pulse'
                : 'bg-[#43881E] hover:bg-[#377218] text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningDemo ? 'SIMULATING EXECUTION...' : 'RUN FULL PIPELINE DEMO'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Command Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Multi-Agent Pipeline (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#FFFFFF] p-4 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DFE4D8]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#43881E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2621]">
                  Multi-Agent Pipeline ({run.agents.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#377218] bg-[#F1F8EC] px-2 py-0.5 rounded border border-[#D1E7C4] font-bold">
                ACTIVE
              </span>
            </div>

            {/* Scrollable Agent List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {run.agents.map((agent) => {
                const Icon = getAgentIcon(agent.id);
                const isSelected = selectedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    id={`agent-card-${agent.id}`}
                    onClick={() => {
                      playCyberBlip(800);
                      setSelectedAgentId(agent.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#43881E] bg-[#F1F8EC] shadow-sm scale-[1.01]'
                        : 'border-[#DFE4D8] bg-[#FAFBF7] hover:border-[#CDD4C6] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#FFFFFF] border-[#D1E7C4] text-[#43881E]'
                              : 'bg-[#FFFFFF] border-[#DFE4D8] text-[#586459]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E2621] flex items-center gap-1.5">
                            <span>{agent.name}</span>
                          </div>
                          <div className="text-[10px] text-[#818D82] line-clamp-1">{agent.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                          agent.status === 'RUNNING'
                            ? 'bg-[#F0F8F9] text-[#20626D] border-[#C7E5E9] animate-pulse'
                            : agent.status === 'COMPLETED'
                            ? 'bg-[#F0F8F3] text-[#17653B] border-[#C8E6D3]'
                            : 'bg-[#FAFBF7] text-[#818D82] border-[#DFE4D8]'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    {/* Task details & Tool pills */}
                    <div className="mt-2 text-xs text-[#4E594F] bg-[#FFFFFF] p-2 rounded-lg border border-[#DFE4D8]">
                      <div className="text-[9px] text-[#818D82] uppercase font-bold">CURRENT TASK</div>
                      <div className="text-[#1E2621] truncate font-medium">{agent.currentTask}</div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {agent.tools.slice(0, 3).map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#586459] border border-[#DFE4D8]"
                        >
                          {tool}
                        </span>
                      ))}
                      {agent.tools.length > 3 && (
                        <span className="text-[9px] text-[#818D82]">
                          +{agent.tools.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Execution Console (5 Cols on LG) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#FFFFFF] p-4 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)] flex flex-col h-[700px]">
            {/* Console Header & Filters */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DFE4D8] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#43881E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2621]">
                  Live Execution Console
                </h3>
              </div>

              <div className="flex items-center gap-1 text-[10px]">
                {(['ALL', 'AGENT', 'DANGER', 'SUCCESS'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      playCyberBlip(700);
                      setLogFilter(filter);
                    }}
                    className={`px-2 py-0.5 rounded transition-colors font-semibold ${
                      logFilter === filter
                        ? 'bg-[#1E2621] text-white shadow-sm'
                        : 'text-[#586459] hover:bg-[#FAFBF7]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Window with Midnight Aesthetic */}
            <div
              id="live-terminal-window"
              className="flex-1 bg-[#080C14] rounded-2xl border border-[#1A2234] p-4 overflow-y-auto font-mono text-xs space-y-1.5 text-[#E6EDF3] shadow-inner leading-relaxed"
            >
              {filteredLogs.map((log) => {
                let badgeStyle = 'text-[#8B949E]';
                if (log.type === 'DANGER') badgeStyle = 'text-[#FF7B72] font-bold';
                if (log.type === 'SUCCESS') badgeStyle = 'text-[#7EE787] font-bold';
                if (log.type === 'AGENT') badgeStyle = 'text-[#D2A8FF] font-semibold';
                if (log.type === 'WARN') badgeStyle = 'text-[#FFA657] font-semibold';
                if (log.type === 'SYSTEM') badgeStyle = 'text-[#79C0FF] font-semibold';

                return (
                  <div key={log.id} className="leading-relaxed hover:bg-[#161B26] p-0.5 rounded transition-colors">
                    <span className="text-[#484F58] select-none mr-2">[{log.time}]</span>
                    <span className={`mr-2 ${badgeStyle}`}>[{log.tag}]</span>
                    <span className={log.type === 'DANGER' ? 'text-[#FF7B72] font-medium' : 'text-[#C9D1D9]'}>
                      {log.message.replace(/^\[\d+:\d+:\d+\]\s*/, '')}
                    </span>
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>

            {/* Console Footer Status */}
            <div className="pt-3 mt-2 border-t border-[#DFE4D8] flex items-center justify-between text-xs text-[#586459] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1E824C] animate-pulse" />
                <span className="font-semibold text-[#1E2621]">STREAM: 100% OPERATIONAL</span>
              </div>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors font-semibold ${
                  autoScroll
                    ? 'bg-[#F1F8EC] text-[#377218] border-[#D1E7C4]'
                    : 'bg-[#FAFBF7] text-[#818D82] border-[#DFE4D8]'
                }`}
              >
                Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Evidence Panel (3 Cols on LG) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#FFFFFF] p-4 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)] flex flex-col h-[700px]">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DFE4D8] shrink-0">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C27918]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2621]">
                  Live Evidence
                </h3>
              </div>

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => {
                    playCyberBlip(750);
                    setEvidenceTab('asan');
                  }}
                  className={`px-2 py-0.5 rounded transition-colors font-semibold ${
                    evidenceTab === 'asan'
                      ? 'bg-[#FEF9F0] text-[#965B0C] border border-[#F8E6C8]'
                      : 'text-[#586459] hover:bg-[#FAFBF7]'
                  }`}
                >
                  ASan Log
                </button>
                <button
                  onClick={() => {
                    playCyberBlip(750);
                    setEvidenceTab('pov-hex');
                  }}
                  className={`px-2 py-0.5 rounded transition-colors font-semibold ${
                    evidenceTab === 'pov-hex'
                      ? 'bg-[#F0F8F9] text-[#20626D] border border-[#C7E5E9]'
                      : 'text-[#586459] hover:bg-[#FAFBF7]'
                  }`}
                >
                  PoV Hex
                </button>
              </div>
            </div>

            {/* Evidence Content */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* Evidence Badges */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                  <span className="text-[#818D82] block text-[8px] font-bold">REPRODUCTION</span>
                  <span className="text-[#B22D42] font-bold">{run.pov.reproductionRate}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                  <span className="text-[#818D82] block text-[8px] font-bold">TARGET FN</span>
                  <span className="text-[#2E7F8C] font-bold truncate block font-mono">parse_header_tag</span>
                </div>
              </div>

              {evidenceTab === 'asan' ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-[#586459] uppercase tracking-wider flex items-center justify-between font-bold">
                    <span>AddressSanitizer Report</span>
                    <span className="text-[#B22D42] font-bold">SEGV (Stack Overflow)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#080C14] border border-[#3D1E24] font-mono text-[10px] text-[#FF7B72] whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[420px] shadow-inner">
                    {run.pov.sanitizerLog}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[10px] text-[#586459] uppercase tracking-wider flex items-center justify-between font-bold">
                    <span>Trigger Payload: pov_crash_001.bin</span>
                    <span className="text-[#2E7F8C] font-bold">77 Bytes</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[#818D82] text-[9px] mb-1 font-bold">HEX STREAM:</div>
                      <div className="break-all font-mono text-xs text-[#79C0FF] bg-[#080C14] p-3 rounded-2xl border border-[#1A2234]">
                        {run.pov.triggerInputHex}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#818D82] text-[9px] mb-1 font-bold">ASCII DECODE:</div>
                      <div className="break-all font-mono text-xs text-[#E6EDF3] bg-[#080C14] p-3 rounded-2xl border border-[#1A2234]">
                        {run.pov.triggerInputAscii}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    playAlertSound();
                    onNavigate('pov');
                  }}
                  className="w-full py-2 px-3 rounded-[10px] bg-[#FDF2F4] hover:bg-[#FBEDEF] border border-[#F7CDD4] text-[#B22D42] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Inspect PoV & Memory Map</span>
                </button>

                <button
                  onClick={() => {
                    playCyberBlip(900);
                    onNavigate('patch-center');
                  }}
                  className="w-full py-2 px-3 rounded-[10px] bg-[#F0F8F3] hover:bg-[#E7F4EB] border border-[#C8E6D3] text-[#17653B] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Review Candidate Patch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
