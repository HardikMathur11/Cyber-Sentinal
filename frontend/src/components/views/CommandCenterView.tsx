import React from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Play,
  Terminal,
  Cpu,
  ArrowRight,
  Sparkles,
  Zap,
  FolderTree,
  ChevronRight,
  Award
} from 'lucide-react';
import { SecurityRun, SafetyMode, NavView } from '../../types';
import { PipelineVisualizer } from '../PipelineVisualizer';
import { playCyberBlip } from '../../utils/audio';

interface CommandCenterViewProps {
  run: SecurityRun;
  safetyMode: SafetyMode;
  onNavigate: (view: NavView) => void;
  onTriggerDemo: () => void;
  isRunningDemo: boolean;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  run,
  safetyMode,
  onNavigate,
  onTriggerDemo,
  isRunningDemo
}) => {
  const metricCards = [
    {
      id: 'active-runs',
      title: 'ACTIVE RUNS',
      value: '03',
      subtext: 'Autonomous Docker Sandboxes',
      icon: Activity,
      borderColor: 'border-[#E2E8F0]',
      glowColor: 'hover:border-[#2563EB]',
      textColor: 'text-[#1E40AF]',
      iconBg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
      tag: 'LIVE',
      tagColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
    },
    {
      id: 'confirmed-vulns',
      title: 'CONFIRMED VULNERABILITIES',
      value: '07',
      subtext: 'PoV Synthesized & Reproducible',
      icon: ShieldAlert,
      borderColor: 'border-[#E2E8F0]',
      glowColor: 'hover:border-[#E11D48]',
      textColor: 'text-[#E11D48]',
      iconBg: 'bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]',
      tag: 'ACTION REQ',
      tagColor: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
    },
    {
      id: 'verified-patches',
      title: 'VERIFIED PATCHES',
      value: '12',
      subtext: 'Zero Regressions, 100% Invariant',
      icon: ShieldCheck,
      borderColor: 'border-[#E2E8F0]',
      glowColor: 'hover:border-[#2563EB]',
      textColor: 'text-[#2563EB]',
      iconBg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      tag: 'VERIFIED',
      tagColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
    },
    {
      id: 'pending-approvals',
      title: 'PENDING APPROVALS',
      value: '02',
      subtext: `Policy: ${safetyMode} Mode`,
      icon: Clock,
      borderColor: 'border-[#E2E8F0]',
      glowColor: 'hover:border-[#B45309]',
      textColor: 'text-[#B45309]',
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
      tag: 'HUMAN GATE',
      tagColor: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
    }
  ];

  return (
    <div id="command-center-view" className="space-y-6 font-sans">
      {/* Top Cyber Command Center Hero Box */}
      <div className="p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(37,99,235,0.06)] relative overflow-hidden rounded-2xl glass-panel">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] tracking-wider uppercase mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping" />
              <span>Autonomous Cyber-Reasoning Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              <span className="text-shine-cobalt">Cyber Sentinel</span> Command Center
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-1.5 max-w-2xl font-medium leading-relaxed">
              End-to-end multi-agent security pipeline: Autonomous reconnaissance, deterministic exploit proof synthesis, verified patch remediation, and mathematical break-my-patch testing.
            </p>
          </div>

          {/* Cyber Reasoning Paradigm Capsule */}
          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs space-y-2.5 shadow-2xs shrink-0">
            <div className="text-[11px] text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Remediation Pipeline</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">Find It</span>
              <span className="text-[#64748B]">→</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">Prove It</span>
              <span className="text-[#64748B]">→</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">Fix It</span>
              <span className="text-[#64748B]">→</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">Attack It</span>
              <span className="text-[#64748B]">→</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">Certify It</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Major Metric Cards with Vibrant Badges & Cyber Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={`metric-card-${card.id}`}
              className={`p-5 rounded-2xl bg-[#FFFFFF] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default border ${card.borderColor} ${card.glowColor} shadow-[0_2px_12px_rgba(15,23,42,0.05)] cyber-card-glass`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#475569] tracking-wider uppercase">
                  {card.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase shadow-2xs ${card.tagColor}`}
                >
                  {card.tag}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className={`text-3xl sm:text-4xl font-extrabold ${card.textColor}`}>
                  {card.value}
                </div>
                <div className={`p-3 rounded-xl border shadow-2xs ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0] text-xs text-[#475569] truncate font-medium">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Security Operation Card with Visual Pipeline */}
      <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  Current Security Operation
                </h3>
                <span className="px-2 py-0.5 text-[10px] rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold font-mono">
                  {run.runId}
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium">
                Target: <strong className="text-[#0F172A]">{run.projectName}</strong> • Language:{' '}
                <span className="text-[#2563EB] font-semibold">{run.projectProfile.language}</span> • Build:{' '}
                <span className="text-[#334155]">{run.projectProfile.buildSystem}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCyberBlip(900);
                onNavigate('live-operation');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFD] hover:bg-[#F0F4FA] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold transition-all shadow-sm"
            >
              <span>Live Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 12-Stage Visual Pipeline */}
        <div className="bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-3">
          <PipelineVisualizer
            stages={run.stages}
            currentStageId={run.currentStage}
            onSelectStage={(stageId) => {
              if (stageId === 'upload' || stageId === 'recon' || stageId === 'attack_surface') {
                onNavigate('project-intelligence');
              } else if (stageId === 'static_analysis') {
                onNavigate('vulnerabilities');
              } else if (stageId === 'fuzzing' || stageId === 'pov') {
                onNavigate('pov');
              } else if (stageId === 'patch') {
                onNavigate('patch-center');
              } else if (stageId === 'verify') {
                onNavigate('verification');
              } else if (stageId === 'break_my_patch') {
                onNavigate('break-my-patch');
              } else if (stageId === 'regression' || stageId === 'performance') {
                onNavigate('regression-performance');
              } else if (stageId === 'certificate') {
                onNavigate('certificates');
              }
            }}
          />
        </div>
      </div>

      {/* Directory & Architecture Graph Quick Access */}
      <div className="p-5 border border-[#E2E8F0] rounded-[14px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFFFF] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0F172A]">
                Project Directory & Code Architecture Graph
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">
                MAPPED & INDEXED
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              18 source files, 74 AST symbols, network socket taint flows, and GoogleTest harnesses.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playCyberBlip(1000);
            onNavigate('project-intelligence');
          }}
          className="px-4 py-2 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-end sm:self-center"
        >
          <span>Open Directory Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Columns: Recent Critical Finding & Agent Execution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Vulnerability Highlight Card */}
        <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E11D48]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Confirmed High-Risk Finding
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
              CVSS 8.8 (HIGH)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#2563EB] font-bold text-sm">VULN-001 • Stack Buffer Overflow</span>
              <span className="text-[#475569] font-mono">src/parser.cpp:142</span>
            </div>

            <p className="text-[#334155] leading-relaxed font-medium">
              Unchecked string copy into 64-byte stack allocation smashes return address pointer. AddressSanitizer SIGSEGV confirmed in guided fuzzing.
            </p>

            {/* Attack Path Visual Strip */}
            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs font-sans overflow-x-auto custom-scrollbar">
              <div className="text-[#64748B] uppercase text-[9px] mb-1 font-bold">PROVEN ATTACK VECTOR</div>
              <div className="flex items-center gap-1.5 text-[#0F172A] font-medium font-mono text-[11px] min-w-max">
                <span className="text-[#2563EB] font-bold">TCP Socket</span>
                <span>→</span>
                <span>parse_header_tag</span>
                <span>→</span>
                <span className="text-[#BE123C] font-bold">strcpy(buffer, input)</span>
                <span>→</span>
                <span className="text-[#E11D48] font-bold">Crash (10/10)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#1D4ED8] flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Candidate Patch #2 Verified</span>
              </div>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('vulnerabilities');
                }}
                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
              >
                Inspect Finding <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Autonomous Remediation & Proof Seal Card */}
        <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Cryptographic Remediation Seal
              </h4>
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

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[9px] font-bold">ORIGINAL POV RE-TEST</span>
                <span className="text-[#1D4ED8] font-bold">BLOCKED (Safe Return)</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[9px] font-bold">BREAK MY PATCH</span>
                <span className="text-[#1D4ED8] font-bold">0 Exploits / 1,250 Tests</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[9px] font-bold">REGRESSION SUITE</span>
                <span className="text-[#1D4ED8] font-bold">47 / 47 Passed (100%)</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[9px] font-bold">PERFORMANCE IMPACT</span>
                <span className="text-[#2563EB] font-bold">+2.4% (Within SLA)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#64748B] font-mono truncate max-w-[200px]">
                SHA-256: e3b0c44298fc1c149af...
              </span>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('certificates');
                }}
                className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1"
              >
                View Certificate <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
