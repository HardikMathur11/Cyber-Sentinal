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
      <div className="bg-[#FFFFFF] p-5 flex flex-wrap items-center justify-between gap-4 border border-[#E2E8F0] rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.05)] cyber-card-glass">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] animate-ping shrink-0" />
          <div>
            <div className="text-base font-bold text-[#0F172A] flex items-center gap-2.5">
              <span>Live Security Operation Monitor</span>
              <span className="text-[#0284C7] font-mono text-xs px-2 py-0.5 rounded-md bg-[#F0F9FF] border border-[#BAE6FD]">
                {run.runId}
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-0.5 font-medium">
              Target: <strong className="text-[#0F172A]">{run.projectName}</strong> • 12 Coordinated Autonomous Agents • Sandboxed Engine
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
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              isRunningDemo
                ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] animate-pulse'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:shadow-md active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningDemo ? 'Executing pipeline...' : 'Execute Sentinel Demo'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Command Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Multi-Agent Pipeline (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.05)] cyber-card-glass">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-[#0F172A]">
                  Multi-Agent Pipeline ({run.agents.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE] font-bold">
                12 Active
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
                        ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm scale-[1.01]'
                        : 'border-[#E2E8F0] bg-[#F8FAFD] hover:border-[#CBD5E1] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#FFFFFF] border-[#BFDBFE] text-[#2563EB]'
                              : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                            <span>{agent.name}</span>
                          </div>
                          <div className="text-[10px] text-[#64748B] line-clamp-1">{agent.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                          agent.status === 'RUNNING'
                            ? 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD] animate-pulse'
                            : agent.status === 'COMPLETED'
                            ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                            : 'bg-[#F8FAFD] text-[#64748B] border-[#E2E8F0]'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    {/* Task details & Tool pills */}
                    <div className="mt-2 text-xs text-[#334155] bg-[#FFFFFF] p-2 rounded-lg border border-[#E2E8F0]">
                      <div className="text-[9px] text-[#64748B] uppercase font-bold">CURRENT TASK</div>
                      <div className="text-[#0F172A] truncate font-medium">{agent.currentTask}</div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {agent.tools.slice(0, 3).map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0]"
                        >
                          {tool}
                        </span>
                      ))}
                      {agent.tools.length > 3 && (
                        <span className="text-[9px] text-[#64748B]">
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
          <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] flex flex-col h-[700px]">
            {/* Console Header & Filters */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
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
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-[#475569] hover:bg-[#F8FAFD]'
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
                  <div key={log.id} className="leading-relaxed hover:bg-[#161B26] p-0.5 rounded transition-colors break-words whitespace-pre-wrap">
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
            <div className="pt-3 mt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#475569] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span className="font-semibold text-[#0F172A]">STREAM: 100% OPERATIONAL</span>
              </div>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors font-semibold ${
                  autoScroll
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                    : 'bg-[#F8FAFD] text-[#64748B] border-[#E2E8F0]'
                }`}
              >
                Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Evidence Panel (3 Cols on LG) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] flex flex-col h-[700px]">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#0284C7]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
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
                      ? 'bg-[#EFF6FF] text-[#0284C7] border border-[#BFDBFE]'
                      : 'text-[#475569] hover:bg-[#F8FAFD]'
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
                      ? 'bg-[#EFF6FF] text-[#0284C7] border border-[#BFDBFE]'
                      : 'text-[#475569] hover:bg-[#F8FAFD]'
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
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[8px] font-bold">REPRODUCTION</span>
                  <span className="text-[#1D4ED8] font-bold">{run.pov.reproductionRate}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block text-[8px] font-bold">TARGET FN</span>
                  <span className="text-[#0284C7] font-bold truncate block font-mono">parse_header_tag</span>
                </div>
              </div>

              {evidenceTab === 'asan' ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider flex items-center justify-between font-bold">
                    <span>AddressSanitizer Report</span>
                    <span className="text-[#0284C7] font-bold">SEGV (Stack Overflow)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#080C14] border border-[#1A2234] font-mono text-[10px] text-[#7EE787] whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[420px] shadow-inner">
                    {run.pov.sanitizerLog}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider flex items-center justify-between font-bold">
                    <span>Trigger Payload: pov_crash_001.bin</span>
                    <span className="text-[#0284C7] font-bold">77 Bytes</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[#64748B] text-[9px] mb-1 font-bold">HEX STREAM:</div>
                      <div className="break-all font-mono text-xs text-[#79C0FF] bg-[#080C14] p-3 rounded-2xl border border-[#1A2234]">
                        {run.pov.triggerInputHex}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#64748B] text-[9px] mb-1 font-bold">ASCII DECODE:</div>
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
                  className="w-full py-2 px-3 rounded-[10px] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Inspect PoV & Memory Map</span>
                </button>

                <button
                  onClick={() => {
                    playCyberBlip(900);
                    onNavigate('patch-center');
                  }}
                  className="w-full py-2 px-3 rounded-[10px] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
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
