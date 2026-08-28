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
      borderColor: 'border-[#DFE4D8]',
      glowColor: 'hover:border-[#43881E]',
      textColor: 'text-[#2D6313]',
      iconBg: 'bg-[#F1F8EC] border-[#D1E7C4] text-[#43881E]',
      tag: 'LIVE',
      tagColor: 'bg-[#F1F8EC] text-[#377218] border-[#D1E7C4]'
    },
    {
      id: 'confirmed-vulns',
      title: 'CONFIRMED VULNERABILITIES',
      value: '07',
      subtext: 'PoV Synthesized & Reproducible',
      icon: ShieldAlert,
      borderColor: 'border-[#DFE4D8]',
      glowColor: 'hover:border-[#D9485D]',
      textColor: 'text-[#D9485D]',
      iconBg: 'bg-[#FDF2F4] border-[#F7CDD4] text-[#B22D42]',
      tag: 'ACTION REQ',
      tagColor: 'bg-[#FDF2F4] text-[#B22D42] border-[#F7CDD4]'
    },
    {
      id: 'verified-patches',
      title: 'VERIFIED PATCHES',
      value: '12',
      subtext: 'Zero Regressions, 100% Invariant',
      icon: ShieldCheck,
      borderColor: 'border-[#DFE4D8]',
      glowColor: 'hover:border-[#1E824C]',
      textColor: 'text-[#1E824C]',
      iconBg: 'bg-[#F0F8F3] border-[#C8E6D3] text-[#17653B]',
      tag: 'VERIFIED',
      tagColor: 'bg-[#F0F8F3] text-[#17653B] border-[#C8E6D3]'
    },
    {
      id: 'pending-approvals',
      title: 'PENDING APPROVALS',
      value: '02',
      subtext: `Policy: ${safetyMode} Mode`,
      icon: Clock,
      borderColor: 'border-[#DFE4D8]',
      glowColor: 'hover:border-[#C27918]',
      textColor: 'text-[#C27918]',
      iconBg: 'bg-[#FEF9F0] border-[#F8E6C8] text-[#965B0C]',
      tag: 'HUMAN GATED',
      tagColor: 'bg-[#FEF9F0] text-[#965B0C] border-[#F8E6C8]'
    }
  ];

  return (
    <div id="command-center-view" className="space-y-6 font-sans">
      {/* Top Cyber Command Center Hero Box */}
      <div className="p-6 sm:p-7 border border-[#DFE4D8] bg-[#FFFFFF] shadow-[0_2px_10px_rgba(30,40,25,0.05)] relative overflow-hidden rounded-[14px]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#43881E] tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-[#43881E] animate-ping" />
              <span>AUTONOMOUS CYBER-REASONING FRAMEWORK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E2621] tracking-tight">
              SENTINEL-<span className="text-[#43881E]">CHAIN</span> COMMAND CENTER
            </h2>
            <p className="text-xs sm:text-sm text-[#586459] mt-1 max-w-2xl font-medium">
              End-to-end multi-agent security pipeline: Autonomous reconnaissance, deterministic exploit proof synthesis, verified patch remediation, and mathematical break-my-patch testing.
            </p>
          </div>

          {/* Cyber Reasoning Paradigm Capsule */}
          <div className="p-4 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] text-xs space-y-2 shadow-sm shrink-0">
            <div className="text-[10px] text-[#43881E] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#43881E]" />
              <span>CYBER-REASONING PARADIGM</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className="text-[#1E824C]">FIND IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#2E7F8C]">PROVE IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#43881E]">FIX IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#D9485D]">ATTACK IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#2E7F8C]">TEST IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#1E824C]">VERIFY IT</span>
              <span className="text-[#818D82]">→</span>
              <span className="text-[#43881E]">CERTIFY IT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Major Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={`metric-card-${card.id}`}
              className={`p-5 rounded-2xl bg-[#FFFFFF] transition-all duration-300 hover:shadow-md cursor-default border ${card.borderColor} ${card.glowColor} shadow-[0_2px_10px_rgba(30,40,25,0.05)]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#586459] tracking-wider">
                  {card.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${card.tagColor}`}
                >
                  {card.tag}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className={`text-3xl sm:text-4xl font-black ${card.textColor}`}>
                  {card.value}
                </div>
                <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#DFE4D8] text-xs text-[#586459] truncate font-medium">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Security Operation Card with Visual Pipeline */}
      <div className="bg-[#FFFFFF] p-6 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#DFE4D8] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F1F8EC] border border-[#D1E7C4] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#43881E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1E2621] uppercase tracking-wider">
                  Current Security Operation
                </h3>
                <span className="px-2 py-0.5 text-[10px] rounded bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] font-bold font-mono">
                  {run.runId}
                </span>
              </div>
              <p className="text-xs text-[#586459] font-medium">
                Target: <strong className="text-[#1E2621]">{run.projectName}</strong> • Language:{' '}
                <span className="text-[#43881E] font-semibold">{run.projectProfile.language}</span> • Build:{' '}
                <span className="text-[#4E594F]">{run.projectProfile.buildSystem}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCyberBlip(900);
                onNavigate('live-operation');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAFBF7] hover:bg-[#F3F6EE] border border-[#DFE4D8] text-[#1E2621] text-xs font-semibold transition-all shadow-sm"
            >
              <span>Live Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 12-Stage Visual Pipeline */}
        <div className="bg-[#FAFBF7] border border-[#DFE4D8] rounded-xl p-3">
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
      <div className="p-5 border border-[#DFE4D8] rounded-[14px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFFFF] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1F8EC] border border-[#D1E7C4] flex items-center justify-center text-[#43881E] shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1E2621]">
                Project Directory & Code Architecture Graph
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] font-bold">
                MAPPED & INDEXED
              </span>
            </div>
            <p className="text-xs text-[#586459] font-medium mt-0.5">
              18 source files, 74 AST symbols, network socket taint flows, and GoogleTest harnesses.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playCyberBlip(1000);
            onNavigate('project-intelligence');
          }}
          className="px-4 py-2 rounded-[10px] bg-[#43881E] hover:bg-[#377218] active:bg-[#2C5E13] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-end sm:self-center"
        >
          <span>Open Directory Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Columns: Recent Critical Finding & Agent Execution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Vulnerability Highlight Card */}
        <div className="bg-[#FFFFFF] p-6 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DFE4D8]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D9485D]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2621]">
                Confirmed High-Risk Finding
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FDF2F4] text-[#B22D42] border border-[#F7CDD4]">
              CVSS 8.8 (HIGH)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#43881E] font-bold text-sm">VULN-001 • Stack Buffer Overflow</span>
              <span className="text-[#586459] font-mono">src/parser.cpp:142</span>
            </div>

            <p className="text-[#4E594F] leading-relaxed font-medium">
              Unchecked string copy into 64-byte stack allocation smashes return address pointer. AddressSanitizer SIGSEGV confirmed in guided fuzzing.
            </p>

            {/* Attack Path Visual Strip */}
            <div className="p-3 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] text-xs font-sans">
              <div className="text-[#818D82] uppercase text-[9px] mb-1 font-bold">PROVEN ATTACK VECTOR</div>
              <div className="flex flex-wrap items-center gap-1.5 text-[#1E2621] font-medium font-mono text-[11px]">
                <span className="text-[#43881E] font-bold">TCP Socket</span>
                <span>→</span>
                <span>parse_header_tag</span>
                <span>→</span>
                <span className="text-[#B22D42] font-bold">strcpy(buffer, input)</span>
                <span>→</span>
                <span className="text-[#D9485D] font-bold">Crash (10/10)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#17653B] flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#1E824C]" />
                <span>Candidate Patch #2 Verified</span>
              </div>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('vulnerabilities');
                }}
                className="text-xs text-[#43881E] hover:underline font-semibold flex items-center gap-1"
              >
                Inspect Finding <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Autonomous Remediation & Proof Seal Card */}
        <div className="bg-[#FFFFFF] p-6 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DFE4D8]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E824C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2621]">
                Cryptographic Remediation Seal
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#F0F8F3] text-[#17653B] border border-[#C8E6D3]">
              VERIFIED PASS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#586459]">Certificate ID:</span>
              <span className="text-[#43881E] font-bold font-mono">SC-2026-001847</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                <span className="text-[#818D82] block text-[9px] font-bold">ORIGINAL POV RE-TEST</span>
                <span className="text-[#17653B] font-bold">BLOCKED (Safe Return)</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                <span className="text-[#818D82] block text-[9px] font-bold">BREAK MY PATCH</span>
                <span className="text-[#17653B] font-bold">0 Exploits / 1,250 Tests</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                <span className="text-[#818D82] block text-[9px] font-bold">REGRESSION SUITE</span>
                <span className="text-[#17653B] font-bold">47 / 47 Passed (100%)</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                <span className="text-[#818D82] block text-[9px] font-bold">PERFORMANCE IMPACT</span>
                <span className="text-[#43881E] font-bold">+2.4% (Within SLA)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#818D82] font-mono truncate max-w-[200px]">
                SHA-256: e3b0c44298fc1c149af...
              </span>
              <button
                onClick={() => {
                  playCyberBlip(850);
                  onNavigate('certificates');
                }}
                className="text-xs text-[#17653B] hover:underline font-semibold flex items-center gap-1"
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
