import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  AlertTriangle,
  Flame,
  Terminal,
  Activity,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { BreakMyPatchData } from '../../types';
import { playCyberBlip, playAlertSound, playSuccessChime } from '../../utils/audio';

interface BreakMyPatchViewProps {
  data: BreakMyPatchData;
  onNavigate: (view: any) => void;
}

export const BreakMyPatchView: React.FC<BreakMyPatchViewProps> = ({ data, onNavigate }) => {
  const [runningStressTest, setRunningStressTest] = useState(false);
  const [simulatedBypass, setSimulatedBypass] = useState(false);
  const [testProgress, setTestProgress] = useState(100);

  const handleRunAdversarialSuite = () => {
    setRunningStressTest(true);
    setSimulatedBypass(false);
    setTestProgress(0);
    playCyberBlip(1100);

    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunningStressTest(false);
          playSuccessChime();
          return 100;
        }
        playCyberBlip(600 + prev * 5);
        return prev + 20;
      });
    }, 250);
  };

  const handleSimulateBypassDetection = () => {
    setSimulatedBypass(true);
    playAlertSound();
  };

  return (
    <div id="break-my-patch-view" className="space-y-6 font-sans">
      {/* Top Header & Attack Narrative */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <Zap className="w-6 h-6 text-[#2563EB] animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                ADVERSARIAL STRESS TESTING ENGINE
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-wide mt-0.5">
                BREAK MY PATCH
              </h2>
              <p className="text-xs text-[#475569] italic mt-1 font-medium">
                "Can the patched system survive variations of the original attack?"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAdversarialSuite}
              disabled={runningStressTest}
              className="px-4 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningStressTest ? `FUZZING (${testProgress}%)...` : 'RUN 1,250 ADVERSARIAL CASES'}</span>
            </button>

            <button
              onClick={handleSimulateBypassDetection}
              className="px-3.5 py-2.5 rounded-[10px] bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Test agent fallback feedback loop"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Bypass Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bypass Detected Banner (Triggered upon bypass condition) */}
      {simulatedBypass && (
        <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-[#BE123C] space-y-2 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#BE123C] font-black text-sm">
              <ShieldAlert className="w-5 h-5 text-[#BE123C]" />
              <span>BYPASS DETECTED (Mutated Payload len=129 null-byte injection)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#BE123C] text-white font-black uppercase">
              REMEDIAL LOOP ENGAGED
            </span>
          </div>
          <p className="text-xs text-[#BE123C] leading-relaxed font-medium">
            The adversarial engine uncovered an edge case where the patch failed. System will automatically route back to the Patch Agent for remediation synthesis attempt #3.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                playCyberBlip(900);
                onNavigate('patch-center');
              }}
              className="px-3 py-1.5 rounded-[10px] bg-[#BE123C] hover:bg-[#9F1239] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Route Back to Patch Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSimulatedBypass(false)}
              className="px-3 py-1.5 rounded-[10px] bg-[#FFFFFF] text-[#0F172A] text-xs hover:bg-[#F8FAFD] border border-[#E2E8F0] font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <span className="text-[#64748B] text-[10px] uppercase block font-bold">ADVERSARIAL CASES</span>
          <div className="text-3xl font-black text-[#0F172A] mt-1">{data.totalCases.toLocaleString()}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block font-medium">6 Attack Vectors</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <span className="text-[#64748B] text-[10px] uppercase block font-bold">BLOCKED PAYLOADS</span>
          <div className="text-3xl font-black text-[#2563EB] mt-1">{data.blocked.toLocaleString()}</div>
          <span className="text-[10px] text-[#1D4ED8] mt-1 block font-semibold">99.76% Rejection Rate</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <span className="text-[#64748B] text-[10px] uppercase block font-bold">SUCCESSFUL EXPLOITS</span>
          <div className="text-3xl font-black text-[#0284C7] mt-1">0</div>
          <span className="text-[10px] text-[#0284C7] mt-1 block font-semibold">Zero Invariant Breaches</span>
        </div>

        <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <span className="text-[#64748B] text-[10px] uppercase block font-bold">PROGRAM CRASHES</span>
          <div className="text-3xl font-black text-[#2563EB] mt-1">0</div>
          <span className="text-[10px] text-[#1D4ED8] mt-1 block font-semibold">ASan Clean Under Fuzz</span>
        </div>
      </div>

      {/* 6 Attack Categories & Live Telemetry Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] text-xs">
            <h3 className="text-[#0F172A] font-bold uppercase tracking-wider">
              MUTATION TEST CATEGORIES
            </h3>
            <span className="text-[#1D4ED8] font-bold">ALL 6 CATEGORIES PASSED</span>
          </div>

          <div className="space-y-3 text-xs">
            {data.categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] hover:border-[#2563EB] transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#0F172A] font-bold">{cat.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {cat.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#475569] font-medium">
                  <span>Cases: {cat.totalCases}</span>
                  <span className="text-[#1D4ED8] font-bold">Blocked: {cat.blocked}</span>
                  <span className="text-[#64748B]">Exploits: {cat.exploits}</span>
                  <span className="text-[#64748B]">Crashes: {cat.crashes}</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${(cat.blocked / cat.totalCases) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Adversarial Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] flex flex-col h-[520px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[#2563EB] font-bold">
              <Terminal className="w-4 h-4" />
              <span>LIVE ADVERSARIAL TELEMETRY</span>
            </div>
            <span className="text-[10px] text-[#64748B]">Mutation Engine</span>
          </div>

          <div className="flex-1 bg-[#080C14] rounded-xl border border-[#1E2638] p-4 font-mono text-xs text-[#E6EDF3] space-y-2 overflow-y-auto shadow-inner">
            {data.liveLog.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('PROVEN RESILIENT') || line.includes('PASSED')
                    ? 'text-[#7EE787] font-bold'
                    : line.includes('BLOCKED')
                    ? 'text-[#79C0FF] font-semibold'
                    : 'text-[#8B949E]'
                }
              >
                {line}
              </div>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
            <span className="flex items-center gap-1 text-[#1D4ED8] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Invariant Holds Against All Permutations</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
