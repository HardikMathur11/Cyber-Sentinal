import React, { useState } from 'react';
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
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatchAttempt, SafetyMode } from '../../types';
import { SyntaxCodeBlock } from '../SyntaxCodeBlock';
import { playCyberBlip, playSuccessChime, playAlertSound } from '../../utils/audio';

interface PatchCenterViewProps {
  patchAttempts: PatchAttempt[];
  activePatchIndex: number;
  onSelectPatchAttempt: (index: number) => void;
  safetyMode: SafetyMode;
  onNavigate: (view: any) => void;
}

export const PatchCenterView: React.FC<PatchCenterViewProps> = ({
  patchAttempts,
  activePatchIndex,
  onSelectPatchAttempt,
  safetyMode,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified-diff' | 'compiler-log'>('side-by-side');
  const [building, setBuilding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [approved, setApproved] = useState(false);

  const activePatch = patchAttempts[activePatchIndex] || patchAttempts[0];

  const handleRunBuild = () => {
    setBuilding(true);
    playCyberBlip(1000);
    setTimeout(() => {
      setBuilding(false);
      playSuccessChime();
    }, 1000);
  };

  const handleTestPatch = () => {
    setTesting(true);
    playCyberBlip(950);
    setTimeout(() => {
      setTesting(false);
      playSuccessChime();
      onNavigate('break-my-patch');
    }, 1200);
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

  return (
    <div id="patch-center-view" className="space-y-6 font-sans">
      {/* Top Header & Patch Attempts Selector */}
      <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                AUTONOMOUS CODE REASONING
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                AI-Generated Remediation & Patch Matrix
              </h2>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunBuild}
              disabled={building}
              className="px-3.5 py-2 rounded-[10px] bg-[#F8FAFD] hover:bg-[#F0F4FA] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${building ? 'animate-spin text-[#2563EB]' : ''}`} />
              <span>{building ? 'RECOMPILING...' : 'RUN BUILD'}</span>
            </button>

            <button
              onClick={handleTestPatch}
              disabled={testing}
              className="px-3.5 py-2 rounded-[10px] bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{testing ? 'TESTING...' : 'TEST PATCH (BREAK MY PATCH)'}</span>
            </button>

            <button
              onClick={handleApprovePatch}
              className={`px-4 py-2 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm btn-cyber-blue ${
                approved
                  ? 'bg-[#2563EB] text-white font-bold'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{approved ? 'PATCH APPROVED ✓' : 'APPROVE PATCH'}</span>
            </button>
          </div>
        </div>

        {/* Patch Attempts Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patchAttempts.map((patch, idx) => {
            const isSelected = activePatchIndex === idx;
            const isVerified = patch.status === 'VERIFIED' || patch.status === 'APPLIED';
            return (
              <button
                key={patch.patchId}
                id={`patch-attempt-tab-${idx}`}
                onClick={() => {
                  playCyberBlip(800 + idx * 50);
                  onSelectPatchAttempt(idx);
                }}
                className={`p-4 rounded-xl border text-left transition-all shadow-sm ${
                  isSelected
                    ? isVerified
                      ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/40'
                      : 'border-[#BE123C] bg-[#FFF1F2] ring-1 ring-[#BE123C]/40'
                    : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFD]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      PATCH ATTEMPT #{patch.attemptNumber}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isVerified
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                        : 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
                    }`}
                  >
                    STATUS: {patch.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-[#475569] line-clamp-1 font-medium">{patch.securityProperty}</div>
                <div className="text-[11px] text-[#64748B] mt-1.5 flex items-center justify-between">
                  <span>+{patch.linesAdded} / -{patch.linesRemoved} Lines</span>
                  <span className={isVerified ? 'text-[#2563EB] font-semibold' : 'text-[#BE123C] font-semibold'}>
                    Build: {patch.buildStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patch Invariant & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-sm">
          <span className="text-[#64748B] text-[10px] block font-bold">FILES CHANGED</span>
          <div className="text-lg font-bold text-[#0F172A] mt-0.5">1 file (src/parser.cpp)</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-sm">
          <span className="text-[#64748B] text-[10px] block font-bold">MUTATION RESILIENCE</span>
          <div className="text-lg font-bold text-[#2563EB] mt-0.5">1,250 / 1,250 Passed</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-sm">
          <span className="text-[#64748B] text-[10px] block font-bold">PERFORMANCE OVERHEAD</span>
          <div className="text-lg font-bold text-[#0284C7] mt-0.5">+2.4% (Within SLA)</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#E2E8F0] rounded-[14px] shadow-sm">
          <span className="text-[#64748B] text-[10px] block font-bold">HUMAN SAFETY GATE</span>
          <div className="text-lg font-bold text-[#B45309] mt-0.5">{safetyMode} Policy</div>
        </div>
      </div>

      {/* Formal Security Property Banner */}
      <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs space-y-1 shadow-sm">
        <div className="text-[11px] text-[#2563EB] uppercase font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>FORMAL SECURITY PROPERTY ASSERTION</span>
        </div>
        <p className="text-[#0F172A] font-semibold">{activePatch.securityProperty}</p>
        <div className="text-xs text-[#475569] mt-1">
          <strong>Verification Assessment:</strong> {activePatch.verificationReason}
        </div>
      </div>

      {/* Side-by-Side Midnight Code Comparison */}
      <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        {/* Comparison Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-bold text-[#0F172A]">src/parser.cpp (parse_header_tag)</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'side-by-side'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#475569] hover:bg-[#F0F4FA]'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setViewMode('unified-diff')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'unified-diff'
                  ? 'bg-[#2E7F8C] text-white shadow-sm'
                  : 'text-[#586459] hover:bg-[#F3F6EE]'
              }`}
            >
              Unified Diff
            </button>
            <button
              onClick={() => setViewMode('compiler-log')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'compiler-log'
                  ? 'bg-[#C27918] text-white shadow-sm'
                  : 'text-[#586459] hover:bg-[#F3F6EE]'
              }`}
            >
              Compiler Logs
            </button>
          </div>
        </div>

        {/* View Mode: Side by Side with Midnight Theme from Screenshot */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT: Vulnerable Code */}
            <div className="space-y-1.5">
              <SyntaxCodeBlock
                code={activePatch.vulnerableCode}
                language="cpp"
                title="BEFORE: VULNERABLE CODE (ORIGINAL)"
                highlightType="vuln"
                showLineNumbers={true}
              />
            </div>

            {/* RIGHT: Patched Code */}
            <div className="space-y-1.5">
              <SyntaxCodeBlock
                code={activePatch.patchedCode}
                language="cpp"
                title={`AFTER: CANDIDATE PATCH #${activePatch.attemptNumber}`}
                highlightType={activePatch.status === 'VERIFIED' ? 'patch' : 'neutral'}
                showLineNumbers={true}
              />
            </div>
          </div>
        )}

        {/* View Mode: Unified Diff */}
        {viewMode === 'unified-diff' && (
          <SyntaxCodeBlock
            code={activePatch.diffText}
            language="diff"
            title="UNIFIED PATCH DIFF (GIT FORMAT)"
            highlightType="diff"
            showLineNumbers={true}
          />
        )}

        {/* View Mode: Compiler Logs */}
        {viewMode === 'compiler-log' && (
          <div className="rounded-2xl border border-[#1E2638] bg-[#0B0F19] text-[#79C0FF] p-4 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
            {activePatch.compilerLogs}
          </div>
        )}
      </div>
    </div>
  );
};
