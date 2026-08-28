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
    <div id="verification-view" className="space-y-6">
      {/* Top Banner: Independent Verification Isolation Wall */}
      <div className="p-6 bg-[#FAF8EE] border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5EA] border border-[#B9DEC1] flex items-center justify-center text-[#19734A] shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#15945E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-[#4F9D18]">
                  ZERO-TRUST EVALUATION
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#E5F4F3] text-[#267982] border border-[#B8DEDB] text-[10px] font-mono-tech font-bold">
                  ISOLATED ORACLE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#202923] font-mono-tech tracking-wide mt-0.5">
                INDEPENDENT VERIFICATION SANDBOX
              </h2>
              <p className="text-xs text-[#687168] mt-1">
                Zero hallucination leakage: The Verification Agent evaluates ONLY objective ground-truth compiler, sanitizer, and fuzzing evidence.
              </p>
            </div>
          </div>

          {/* Isolation Barrier Card */}
          <div className="bg-[#FFFDF5] border border-[#DDE0D5] rounded-xl p-3 font-mono-tech text-xs flex items-center gap-3 shrink-0 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#EAF4DF] border border-[#C7DEB5] flex items-center justify-center text-[#4F9D18]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#687168] uppercase font-bold">PATCH AGENT REASONING</div>
              <div className="text-[#202923] font-bold flex items-center gap-1.5">
                <span>🔒 STRICTLY ISOLATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Card & Objective Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Result Decision (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] space-y-4 shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD2]">
            <h3 className="text-sm font-mono-tech font-bold uppercase tracking-wider text-[#202923]">
              VERIFICATION RESULT
            </h3>
            <span className="text-xs font-mono-tech text-[#19734A] font-bold">
              CONFIDENCE: {verification.confidence}%
            </span>
          </div>

          {/* Decision Big Badge */}
          <div
            className={`p-6 rounded-2xl border text-center font-mono-tech space-y-2 transition-all shadow-sm ${
              decisionOverride === 'PASS'
                ? 'bg-[#E8F5EA] border-[#B9DEC1]'
                : decisionOverride === 'FAIL'
                ? 'bg-[#FBE7EA] border-[#F1B8C2]'
                : 'bg-[#FFF1D6] border-[#F0D39D]'
            }`}
          >
            <div className="text-xs text-[#687168] uppercase tracking-widest font-bold">FINAL VERDICT</div>
            <div
              className={`text-4xl font-black tracking-widest ${
                decisionOverride === 'PASS'
                  ? 'text-[#15945E]'
                  : decisionOverride === 'FAIL'
                  ? 'text-[#E54862]'
                  : 'text-[#D98A16]'
              }`}
            >
              {decisionOverride}
            </div>
            <div className="text-xs text-[#59635A] max-w-sm mx-auto leading-relaxed pt-2 font-medium">
              {verification.reason}
            </div>
          </div>

          {/* Interactive Decision Switcher for Simulation Testing */}
          <div className="pt-2 border-t border-[#DCDDD2] space-y-2">
            <span className="text-[10px] font-mono-tech text-[#687168] uppercase block font-bold">
              EVALUATE CANDIDATE VERDICT STATES:
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono-tech text-xs">
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
                        ? 'bg-[#15945E] text-white border-[#15945E]'
                        : state === 'FAIL'
                        ? 'bg-[#E54862] text-white border-[#E54862]'
                        : 'bg-[#D98A16] text-white border-[#D98A16]'
                      : 'bg-[#FAF8EE] text-[#536053] border-[#DCDDD2] hover:text-[#202923]'
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
            className="w-full py-2.5 rounded-[10px] bg-[#4F9D18] hover:bg-[#3F8414] active:bg-[#356F12] text-white font-mono-tech font-black text-xs flex items-center justify-center gap-2 shadow-[0_2px_6px_rgba(45,70,30,0.10)] transition-all"
          >
            <Award className="w-4 h-4" />
            <span>MINT REMEDIATION CERTIFICATE</span>
          </button>
        </div>

        {/* Objective Evidence Ledger (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] space-y-4 shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD2]">
            <h3 className="text-sm font-mono-tech font-bold uppercase tracking-wider text-[#202923]">
              OBJECTIVE EVIDENCE LEDGER
            </h3>
            <span className="text-xs font-mono-tech text-[#687168] font-bold">
              7 / 7 Invariants Satisfied
            </span>
          </div>

          <div className="space-y-2.5 font-mono-tech text-xs">
            {objectiveEvidenceChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] hover:border-[#15945E] transition-all space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#202923] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15945E] shrink-0" />
                    <span>{item.title}</span>
                  </span>
                  <span className="text-[10px] text-[#19734A] font-bold bg-[#E8F5EA] px-2 py-0.5 rounded border border-[#B9DEC1]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-[#687168] pl-5 font-medium">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
