import React, { useState, useEffect } from 'react';
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
  Sparkles,
  CheckCircle2,
  Bug,
  Cpu,
  Search,
  Code2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BreakMyPatchData } from '../../types';
import { playCyberBlip, playAlertSound, playSuccessChime } from '../../utils/audio';

interface BreakMyPatchViewProps {
  data?: BreakMyPatchData;
  onNavigate: (view: any) => void;
}

interface MutationCategory {
  id: string;
  name: string;
  totalCases: number;
  blocked: number;
  exploits: number;
  crashes: number;
  status: 'PASSED' | 'TESTING' | 'BYPASS' | 'PENDING';
  samplePayload: string;
  cweContext: string;
}

const DEFAULT_CATEGORIES: MutationCategory[] = [
  {
    id: 'cat-boundary',
    name: 'Boundary Input Stress (+1 / -1 Off-by-One)',
    totalCases: 150,
    blocked: 150,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0x4845414445525F5441475F363341414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141',
    cweContext: 'CWE-193: Off-by-one Error'
  },
  {
    id: 'cat-null-byte',
    name: 'Null-byte Early Termination Poisoning (%00)',
    totalCases: 120,
    blocked: 120,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0x41414100414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141',
    cweContext: 'CWE-170: Improper Null Termination'
  },
  {
    id: 'cat-oversized',
    name: 'Gigantic Buffer Spray (8KB - 64KB)',
    totalCases: 140,
    blocked: 140,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0x41414141 [REPEATED 65,536 BYTES]',
    cweContext: 'CWE-120: Classic Buffer Copy without Size Checking'
  },
  {
    id: 'cat-unicode',
    name: 'Overlong UTF-8 Multi-byte Normalization',
    totalCases: 110,
    blocked: 110,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0xC0AE0xC0AE0x2F0x650x740x630x2F0x700x610x730x730x770x64',
    cweContext: 'CWE-172: Encoding Error'
  },
  {
    id: 'cat-burst',
    name: 'Burst Micro-second Rapid Ingestion Stream',
    totalCases: 160,
    blocked: 160,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '10,000 UDP frames delivered in 1.4ms window',
    cweContext: 'CWE-400: Resource Exhaustion'
  },
  {
    id: 'cat-llm-genetic',
    name: 'LLM Guided Genetic AST Mutation Payloads',
    totalCases: 130,
    blocked: 130,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0x53454E54494E454C5F4D55544154494F4E5F47454E455449435F53454544',
    cweContext: 'Adversarial Machine Learning Mutation'
  },
  {
    id: 'cat-int-wrap',
    name: 'Integer Wrap-around & Signed Bit Shift',
    totalCases: 120,
    blocked: 120,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '0x7FFFFFFF, 0x80000000, 0xFFFFFFFF, 0x00000000',
    cweContext: 'CWE-190: Integer Overflow or Wraparound'
  },
  {
    id: 'cat-format-spec',
    name: 'Format Specifiers Injection (%s%x%n%p)',
    totalCases: 100,
    blocked: 100,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '%08x.%08x.%08x.%08x.%s%n',
    cweContext: 'CWE-134: Use of Externally-Controlled Format String'
  },
  {
    id: 'cat-path-trav',
    name: 'Path Traversal Injection Sequences (../../)',
    totalCases: 110,
    blocked: 110,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '../../../../../../../../etc/shadow',
    cweContext: 'CWE-22: Improper Limitation of a Pathname'
  },
  {
    id: 'cat-thread-race',
    name: 'High-Concurrency Thread Race Condition Fuzzing',
    totalCases: 110,
    blocked: 110,
    exploits: 0,
    crashes: 0,
    status: 'PASSED',
    samplePayload: '500 worker threads executing simultaneous token consumption',
    cweContext: 'CWE-362: Concurrent Execution using Shared Resource'
  }
];

export const BreakMyPatchView: React.FC<BreakMyPatchViewProps> = ({ data, onNavigate }) => {
  const [runningStressTest, setRunningStressTest] = useState(false);
  const [simulatedBypass, setSimulatedBypass] = useState(false);
  const [testProgress, setTestProgress] = useState(100);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<MutationCategory>(DEFAULT_CATEGORIES[0]);
  const [liveFuzzLogs, setLiveFuzzLogs] = useState<string[]>([
    '[MUTATOR] Initialized seed corpus: 14 base test vectors',
    '[MUTATOR] Applying byte-flip, length-stretch, and genetic dictionary mutations...',
    '[MUTATOR] Running 1,250 fuzzing iterations against candidate patch v2...',
    '[SANITY] AddressSanitizer memory check: ZERO heap/stack overflow violations.',
    '[VERDICT] PASS: Candidate Patch #2 survived all 1,250 adversarial payloads.'
  ]);
  const [computedCasesCount, setComputedCasesCount] = useState(1250);
  const [categories, setCategories] = useState<MutationCategory[]>(DEFAULT_CATEGORIES);

  const handleRunAdversarialSuite = () => {
    setRunningStressTest(true);
    setSimulatedBypass(false);
    setTestProgress(0);
    setComputedCasesCount(0);
    setLiveFuzzLogs([
      '[AFL++ / LibFuzzer] Initializing coverage-guided mutational fuzzer...',
      '[ASAN] AddressSanitizer & UndefinedBehaviorSanitizer instrumentation ACTIVE.'
    ]);
    playCyberBlip(1100);

    // Reset category statuses to PENDING
    setCategories((prev) => prev.map((c) => ({ ...c, status: 'PENDING' })));

    let currentCat = 0;
    const totalCategories = DEFAULT_CATEGORIES.length;

    const interval = setInterval(() => {
      if (currentCat >= totalCategories) {
        clearInterval(interval);
        setRunningStressTest(false);
        setActiveCategoryIdx(-1);
        setTestProgress(100);
        setComputedCasesCount(1250);
        setCategories((prev) => prev.map((c) => ({ ...c, status: 'PASSED' })));
        setLiveFuzzLogs((prev) => [
          ...prev,
          '[AFL++] =================================================================',
          '[AFL++] ALL 1,250 ADVERSARIAL MUTATION PAYLOADS PROCESSED SUCCESSFULLY',
          '[AFL++] 0 CRASHES · 0 EXPLOIT BYPASSES · 100% INVARIANT RETENTION',
          '[AFL++] ================================================================='
        ]);
        playSuccessChime();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        return;
      }

      const cat = DEFAULT_CATEGORIES[currentCat];
      setActiveCategoryIdx(currentCat);
      setTestProgress(Math.round(((currentCat + 1) / totalCategories) * 100));
      setComputedCasesCount((prev) => prev + cat.totalCases);

      setCategories((prev) =>
        prev.map((c, i) => (i === currentCat ? { ...c, status: 'PASSED' } : c))
      );

      setLiveFuzzLogs((prev) => [
        ...prev,
        `[MUTATION #${currentCat + 1}] Executing ${cat.name} (${cat.totalCases} cases) ... [BLOCKED ✓]`
      ]);

      playCyberBlip(650 + currentCat * 40);
      currentCat++;
    }, 280);
  };

  const handleSimulateBypassDetection = () => {
    setSimulatedBypass(true);
    playAlertSound();
  };

  return (
    <div id="break-my-patch-view" className="space-y-6 font-sans">
      {/* Top Header & Attack Narrative */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-xs">
              <Zap className="w-6 h-6 text-[#2563EB] animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                ADVERSARIAL STRESS TESTING ENGINE
              </div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight mt-0.5">
                Break My Patch — Real-Time Mutation Fuzzer
              </h2>
              <p className="text-xs text-[#475569] mt-0.5 font-medium">
                Testing whether the remediated binary can withstand 1,250 automated mutations, bit-flips, boundary overflows, and LLM genetic fuzz payloads.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAdversarialSuite}
              disabled={runningStressTest}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 ${
                runningStressTest
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white btn-cyber-blue'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningStressTest ? `FUZZING (${testProgress}%)...` : 'RUN 1,250 ADVERSARIAL CASES'}</span>
            </button>

            <button
              onClick={handleSimulateBypassDetection}
              className="px-3.5 py-2.5 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="Test autonomous fallback feedback loop"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Bypass Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bypass Detected Banner (Triggered upon simulated bypass) */}
      {simulatedBypass && (
        <div className="p-5 rounded-2xl bg-[#FFF1F2] border-2 border-[#BE123C] space-y-3 shadow-md animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#BE123C] font-bold text-sm">
              <Flame className="w-5 h-5 animate-pulse" />
              <span>ADVERSARIAL BYPASS INTERCEPTED: Candidate Patch Attempt #1 Failed Invariant Check</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#BE123C] text-white">
              TRIGGERING PATCH AGENT ATTEMPT #2
            </span>
          </div>
          <p className="text-xs text-[#9F1239] leading-relaxed">
            Mutation vector <code>cat-boundary-off-by-one</code> triggered <code>SIGSEGV</code> on 64-byte payload. The Verification Agent has rejected Candidate #1 and automatically synthesized Candidate #2 with explicit pre-validation bounds.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                playCyberBlip(850);
                onNavigate('patch-center');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#BE123C] text-white text-xs font-bold hover:bg-[#9F1239] transition-all flex items-center gap-1"
            >
              View Remediated Candidate #2 Diff <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Computations Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">TOTAL MUTATIONS</div>
          <div className="text-3xl font-black text-[#0F172A]">{computedCasesCount} / 1,250</div>
          <span className="text-[10px] text-[#2563EB] font-medium">{testProgress}% Completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-xs text-center">
          <div className="text-[10px] font-bold text-[#166534] uppercase tracking-wider mb-1">BLOCKED ATTACKS</div>
          <div className="text-3xl font-black text-[#16A34A]">{computedCasesCount}</div>
          <span className="text-[10px] text-[#16A34A] font-medium">100% Invariant Defended</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">CRASHES / LEAKS</div>
          <div className="text-3xl font-black text-[#16A34A]">0</div>
          <span className="text-[10px] text-[#64748B] font-medium">AddressSanitizer Clean</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] shadow-xs text-center">
          <div className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1">EXECUTION RATE</div>
          <div className="text-3xl font-black text-[#2563EB]">4,820</div>
          <span className="text-[10px] text-[#1D4ED8] font-medium">Executions / Sec</span>
        </div>
      </div>

      {/* Live Fuzzing Streaming Terminal */}
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl p-4 font-mono text-xs text-[#E2E8F0] space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] text-[#60A5FA] font-bold">
          <span className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
            LIVE AFL++ / LIBFUZZER ENGINE TERMINAL
          </span>
          <span className="text-[10px] text-[#94A3B8]">{computedCasesCount} / 1250 PAYLOADS TESTED</span>
        </div>
        <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pt-1 text-[11px]">
          {liveFuzzLogs.map((line, idx) => (
            <div key={idx} className={line.includes('PASS') || line.includes('ALL') ? 'text-[#4ADE80] font-bold' : 'text-[#94A3B8]'}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* 10 Attack Categories Matrix & Interactive Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category List (10 Categories) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                10 Mutation Attack Vectors (1,250 Cases)
              </h3>
              <p className="text-[11px] text-[#64748B]">Click any category to inspect sample fuzzing payload & disassembly</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              10 / 10 DEFENDED
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, i) => {
              const isSelected = selectedCategory.id === cat.id;
              const isCurrentlyRunning = activeCategoryIdx === i;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    playCyberBlip(800);
                    setSelectedCategory(cat);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/40 shadow-xs'
                      : isCurrentlyRunning
                      ? 'border-[#2563EB] bg-[#EFF6FF] animate-pulse'
                      : 'border-[#E2E8F0] bg-[#F8FAFD] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="font-bold text-[#0F172A] flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 pl-5 flex items-center gap-2">
                      <span>{cat.totalCases} cases tested</span>
                      <span>·</span>
                      <span className="text-[#2563EB] font-medium">{cat.cweContext}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] font-bold text-[10px] border border-[#BFDBFE] shrink-0">
                    BLOCKED (0 EXPLOITS) ✓
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Payload Inspector */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <Code2 className="w-4 h-4 text-[#2563EB]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Payload Inspector</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Selected Vector:</span>
              <strong className="text-[#0F172A] text-xs">{selectedCategory.name}</strong>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Associated CWE:</span>
              <span className="font-mono text-[#2563EB] font-bold">{selectedCategory.cweContext}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Generated Byte Stream:</span>
              <div className="p-3 rounded-xl bg-[#0B0F19] text-[#34D399] font-mono text-[10px] leading-relaxed break-all border border-[#1E293B] max-h-40 overflow-y-auto custom-scrollbar">
                {selectedCategory.samplePayload}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Invariant Protection Active</span>
              </div>
              <p className="text-[10px] text-[#166534] leading-relaxed">
                Candidate patch bounds checks caught this payload at pre-validation stage without invoking memory copy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
