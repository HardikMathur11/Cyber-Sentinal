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
    <div id="break-my-patch-view" className="space-y-6">
      {/* Top Header & Attack Narrative */}
      <div className="p-6 bg-[#FAF8EE] border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EAF4DF] border border-[#C7DEB5] flex items-center justify-center text-[#4F9D18] shadow-sm">
              <Zap className="w-6 h-6 text-[#4F9D18] animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-[#4F9D18]">
                ADVERSARIAL STRESS TESTING ENGINE
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#202923] font-mono-tech tracking-wide mt-0.5">
                BREAK MY PATCH
              </h2>
              <p className="text-xs text-[#687168] italic mt-1 font-medium">
                "Can the patched system survive variations of the original attack?"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAdversarialSuite}
              disabled={runningStressTest}
              className="px-4 py-2.5 rounded-[10px] bg-[#4F9D18] hover:bg-[#3F8414] active:bg-[#356F12] text-white font-mono-tech font-bold text-xs flex items-center gap-2 transition-all shadow-[0_2px_6px_rgba(45,70,30,0.10)] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningStressTest ? `FUZZING (${testProgress}%)...` : 'RUN 1,250 ADVERSARIAL CASES'}</span>
            </button>

            <button
              onClick={handleSimulateBypassDetection}
              className="px-3.5 py-2.5 rounded-[10px] bg-[#FBE7EA] hover:bg-[#F1B8C2] border border-[#F1B8C2] text-[#C62F49] font-mono-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
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
        <div className="p-4 rounded-xl bg-[#FBE7EA] border-2 border-[#E54862] font-mono-tech space-y-2 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C62F49] font-black text-sm">
              <ShieldAlert className="w-5 h-5 text-[#E54862]" />
              <span>BYPASS DETECTED (Mutated Payload len=129 null-byte injection)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E54862] text-white font-black uppercase">
              REMEDIAL LOOP ENGAGED
            </span>
          </div>
          <p className="text-xs text-[#C62F49] leading-relaxed font-medium">
            The adversarial engine uncovered an edge case where the patch failed. System will automatically route back to the Patch Agent for remediation synthesis attempt #3.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                playCyberBlip(900);
                onNavigate('patch-center');
              }}
              className="px-3 py-1.5 rounded-[10px] bg-[#E54862] hover:bg-[#C62F49] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Route Back to Patch Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSimulatedBypass(false)}
              className="px-3 py-1.5 rounded-[10px] bg-[#FFFDF5] text-[#202923] text-xs hover:bg-[#FAF8EE] border border-[#DCDDD2] font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-tech">
        <div className="bg-[#FFFDF5] p-5 border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <span className="text-[#687168] text-[10px] uppercase block font-bold">ADVERSARIAL CASES</span>
          <div className="text-3xl font-black text-[#202923] mt-1">{data.totalCases.toLocaleString()}</div>
          <span className="text-[10px] text-[#687168] mt-1 block font-medium">6 Attack Vectors</span>
        </div>

        <div className="bg-[#FFFDF5] p-5 border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <span className="text-[#687168] text-[10px] uppercase block font-bold">BLOCKED PAYLOADS</span>
          <div className="text-3xl font-black text-[#15945E] mt-1">{data.blocked.toLocaleString()}</div>
          <span className="text-[10px] text-[#19734A] mt-1 block font-semibold">99.76% Rejection Rate</span>
        </div>

        <div className="bg-[#FFFDF5] p-5 border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <span className="text-[#687168] text-[10px] uppercase block font-bold">SUCCESSFUL EXPLOITS</span>
          <div className="text-3xl font-black text-[#2D9AA6] mt-1">0</div>
          <span className="text-[10px] text-[#267982] mt-1 block font-semibold">Zero Invariant Breaches</span>
        </div>

        <div className="bg-[#FFFDF5] p-5 border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <span className="text-[#687168] text-[10px] uppercase block font-bold">PROGRAM CRASHES</span>
          <div className="text-3xl font-black text-[#15945E] mt-1">0</div>
          <span className="text-[10px] text-[#19734A] mt-1 block font-semibold">ASan Clean Under Fuzz</span>
        </div>
      </div>

      {/* 6 Attack Categories & Live Telemetry Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] space-y-4 shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCDDD2] font-mono-tech text-xs">
            <h3 className="text-[#202923] font-bold uppercase tracking-wider">
              MUTATION TEST CATEGORIES
            </h3>
            <span className="text-[#19734A] font-bold">ALL 6 CATEGORIES PASSED</span>
          </div>

          <div className="space-y-3 font-mono-tech text-xs">
            {data.categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] hover:border-[#4F9D18] transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#202923] font-bold">{cat.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5EA] text-[#19734A] border border-[#B9DEC1]">
                    {cat.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#687168] font-medium">
                  <span>Cases: {cat.totalCases}</span>
                  <span className="text-[#19734A] font-bold">Blocked: {cat.blocked}</span>
                  <span className="text-[#687168]">Exploits: {cat.exploits}</span>
                  <span className="text-[#687168]">Crashes: {cat.crashes}</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#DCDDD2] overflow-hidden">
                  <div
                    className="h-full bg-[#4F9D18] rounded-full"
                    style={{ width: `${(cat.blocked / cat.totalCases) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Adversarial Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] flex flex-col h-[520px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCDDD2] font-mono-tech text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[#4F9D18] font-bold">
              <Terminal className="w-4 h-4" />
              <span>LIVE ADVERSARIAL TELEMETRY</span>
            </div>
            <span className="text-[10px] text-[#687168]">Mutation Engine</span>
          </div>

          <div className="flex-1 bg-[#F1F0E9] rounded-xl border border-[#D5D8CF] p-4 font-mono-tech text-xs text-[#29332C] space-y-2 overflow-y-auto shadow-inner">
            {data.liveLog.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('PROVEN RESILIENT') || line.includes('PASSED')
                    ? 'text-[#19734A] font-bold'
                    : line.includes('BLOCKED')
                    ? 'text-[#267982] font-semibold'
                    : 'text-[#59635A]'
                }
              >
                {line}
              </div>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-[#DCDDD2] flex items-center justify-between font-mono-tech text-[11px] text-[#687168] shrink-0">
            <span className="flex items-center gap-1 text-[#19734A] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15945E]" />
              <span>Invariant Holds Against All Permutations</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
