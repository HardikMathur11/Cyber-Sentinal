import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Binary,
  RotateCcw
} from 'lucide-react';
import { VerificationResult, SecurityRun } from '../../types';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface IndependentVerificationViewProps {
  verification: VerificationResult;
  onNavigate: (view: any) => void;
}

export const IndependentVerificationView: React.FC<IndependentVerificationViewProps> = ({
  verification,
  onNavigate
}) => {
  const [decisionOverride, setDecisionOverride] = useState<'PASS' | 'FAIL' | 'INCONCLUSIVE'>(
    verification.decision
  );

  const objectiveEvidenceChecklist = [
    { title: 'Original Vulnerability Description', detail: 'Stack buffer overflow in parse_header_tag (CWE-121). Unbounded strcpy memory write.', verified: true },
    { title: 'Relevant Source Code', detail: 'src/parser.cpp:138-154 & CMakeLists.txt build dependencies.', verified: true },
    { title: 'Original Proof of Vulnerability (PoV)', detail: 'pov_crash_001.bin (77 bytes) triggering deterministic AddressSanitizer SEGV.', verified: true },
    { title: 'Patched Build Artifact', detail: 'Target compiled cleanly with Clang 18 under ASan/UBSan with zero diagnostic errors.', verified: true },
    { title: 'PoV Re-test Result', detail: 'BLOCKED: Target rejected payload with return code ERROR_HEADER_TOO_LONG.', verified: true },
    { title: 'Regression Test Results', detail: '47 / 47 GoogleTest unit tests passed with 0 functional regressions.', verified: true },
    { title: 'Adversarial Mutation Results', detail: '0 exploits and 0 crashes across 1,250 boundary and mutational payloads.', verified: true }
  ];

  return (
    <div id="verification-view" className="space-y-6 font-sans">
      {/* Top Banner: Independent Verification Isolation Wall */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  ZERO-TRUST EVALUATION
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] text-[10px] font-bold">
                  ISOLATED ORACLE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-wide mt-0.5">
                INDEPENDENT VERIFICATION SANDBOX
              </h2>
              <p className="text-xs text-[#475569] mt-1">
                Zero hallucination leakage: The Verification Agent evaluates ONLY objective ground-truth compiler, sanitizer, and fuzzing evidence.
              </p>
            </div>
          </div>

          {/* Isolation Barrier Card */}
          <div className="bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-3 text-xs flex items-center gap-3 shrink-0 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-bold">PATCH AGENT REASONING</div>
              <div className="text-[#0F172A] font-bold flex items-center gap-1.5">
                <span>🔒 STRICTLY ISOLATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Card & Objective Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Result Decision (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              VERIFICATION RESULT
            </h3>
            <span className="text-xs text-[#1D4ED8] font-bold">
              CONFIDENCE: {verification.confidence}%
            </span>
          </div>

          {/* Decision Big Badge */}
          <div
            className={`p-6 rounded-2xl border text-center space-y-2 transition-all shadow-sm ${
              decisionOverride === 'PASS'
                ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                : decisionOverride === 'FAIL'
                ? 'bg-[#FFF1F2] border-[#FECDD3]'
                : 'bg-[#FFFBEB] border-[#FDE68A]'
            }`}
          >
            <div className="text-xs text-[#64748B] uppercase tracking-widest font-bold">FINAL VERDICT</div>
            <div
              className={`text-4xl font-black tracking-widest ${
                decisionOverride === 'PASS'
                  ? 'text-[#2563EB]'
                  : decisionOverride === 'FAIL'
                  ? 'text-[#BE123C]'
                  : 'text-[#B45309]'
              }`}
            >
              {decisionOverride}
            </div>
            <div className="text-xs text-[#334155] max-w-sm mx-auto leading-relaxed pt-2 font-medium">
              {verification.reason}
            </div>
          </div>

          {/* Interactive Decision Switcher for Simulation Testing */}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
            <span className="text-[10px] text-[#64748B] uppercase block font-bold">
              EVALUATE CANDIDATE VERDICT STATES:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['PASS', 'FAIL', 'INCONCLUSIVE'] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    playCyberBlip(800);
                    setDecisionOverride(state);
                  }}
                  className={`py-2 rounded-lg border text-center font-bold transition-all shadow-sm ${
                    decisionOverride === state
                      ? state === 'PASS'
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : state === 'FAIL'
                        ? 'bg-[#BE123C] text-white border-[#BE123C]'
                        : 'bg-[#B45309] text-white border-[#B45309]'
                      : 'bg-[#F8FAFD] text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              playCyberBlip(950);
              onNavigate('certificates');
            }}
            className="w-full py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>MINT REMEDIATION CERTIFICATE</span>
          </button>
        </div>

        {/* Objective Evidence Ledger (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              OBJECTIVE EVIDENCE LEDGER
            </h3>
            <span className="text-xs text-[#64748B] font-bold">
              7 / 7 Invariants Satisfied
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {objectiveEvidenceChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] hover:border-[#2563EB] transition-all space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#0F172A] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>{item.title}</span>
                  </span>
                  <span className="text-[10px] text-[#1D4ED8] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] pl-5 font-medium">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
