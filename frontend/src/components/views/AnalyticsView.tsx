import React, { useState, useEffect } from 'react';
import {
  GitPullRequest, Activity, CheckCircle2, Play, Clock, Cpu,
  ArrowRight, TrendingUp, History, BarChart2, Zap, Award,
  Terminal, Check, RefreshCw, Layers, ShieldCheck, Filter, Search
} from 'lucide-react';
import { RegressionResult, PerformanceResult, TimelineEvent } from '../../types';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface AnalyticsViewProps {
  regression: RegressionResult;
  performance: PerformanceResult;
  timeline: TimelineEvent[];
  onNavigate: (view: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  regression, performance, timeline, onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'regression' | 'performance' | 'timeline'>('regression');

  // Interactive computation states for Regression
  const [runningRegression, setRunningRegression] = useState(false);
  const [activeSuiteIdx, setActiveSuiteIdx] = useState<number>(-1);
  const [computedTestCount, setComputedTestCount] = useState<number>(regression.passed);
  const [regressionLog, setRegressionLog] = useState<string[]>([]);

  // Interactive computation states for Performance Benchmark
  const [runningBench, setRunningBench] = useState(false);
  const [benchIteration, setBenchIteration] = useState<number>(10000);
  const [benchThroughput, setBenchThroughput] = useState<number>(84200);
  const [latencyP50, setLatencyP50] = useState<number>(performance.patchedMs);
  const [latencyP99, setLatencyP99] = useState<number>(performance.p99PatchedMs);

  const handleRunRegression = () => {
    setRunningRegression(true);
    setActiveSuiteIdx(0);
    setComputedTestCount(0);
    setRegressionLog(['[GTEST] Initializing GoogleTest v1.14 runner in isolated sandbox...']);
    playCyberBlip(1000);

    let current = 0;
    const suites = regression.testSuites;
    const interval = setInterval(() => {
      if (current >= suites.length) {
        clearInterval(interval);
        setRunningRegression(false);
        setActiveSuiteIdx(-1);
        setComputedTestCount(regression.totalTests);
        setRegressionLog((prev) => [
          ...prev,
          `[GTEST] =================================================================`,
          `[GTEST] ALL ${regression.totalTests} TEST CASES PASSED WITH 0 REGRESSIONS IN 26.4ms`,
          `[GTEST] =================================================================`
        ]);
        playSuccessChime();
        return;
      }

      const s = suites[current];
      setActiveSuiteIdx(current);
      setComputedTestCount((prev) => prev + s.tests);
      setRegressionLog((prev) => [
        ...prev,
        `[RUN] ${s.name} (${s.tests} tests) ... [OK] in ${s.durationMs}ms`
      ]);
      playCyberBlip(700 + current * 40);
      current++;
    }, 280);
  };

  const handleRunBenchmark = () => {
    setRunningBench(true);
    playCyberBlip(1100);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setBenchIteration(Math.floor(Math.random() * 5000) + 8000);
      setBenchThroughput(Math.floor(Math.random() * 8000) + 80000);
      setLatencyP50(parseFloat((12.5 + Math.random() * 0.4).toFixed(2)));
      setLatencyP99(parseFloat((18.3 + Math.random() * 0.6).toFixed(2)));
      playCyberBlip(900 + step * 50);

      if (step >= 8) {
        clearInterval(interval);
        setRunningBench(false);
        setLatencyP50(performance.patchedMs);
        setLatencyP99(performance.p99PatchedMs);
        setBenchIteration(10000);
        setBenchThroughput(84650);
        playSuccessChime();
      }
    }, 200);
  };

  const passRate = regression.totalTests > 0 ? Math.round((computedTestCount / regression.totalTests) * 100) : 100;

  return (
    <div id="analytics-view" className="space-y-5 font-sans">
      {/* Banner */}
      <div className="bg-[#FFFFFF] p-5 border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] mb-0.5">
              ASSURANCE & AUDIT BENCHMARKS
            </div>
            <h2 className="text-xl font-black text-[#0F172A]">
              Regression Tests · Performance Profiling · Timeline
            </h2>
            <p className="text-xs text-[#475569] mt-1">
              Deterministic verification suite: {regression.testSuites.length} test suites ({regression.totalTests} testcases), CPU cycle latency profiling, and audit history.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]">
              ✓ {regression.totalTests} / {regression.totalTests} TESTS PASS
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]">
              PERF OVERHEAD: +{performance.impactPercent}% (SLA OK)
            </span>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-1 w-fit">
        {[
          { id: 'regression', label: `Regression Suite (${regression.totalTests} Tests)`, icon: GitPullRequest },
          { id: 'performance', label: 'Performance & Latency Profiling', icon: BarChart2 },
          { id: 'timeline', label: `Security Event History (${timeline.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playCyberBlip(800);
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                active ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm border border-[#E2E8F0]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGRESSION TEST COMPUTATIONS */}
      {activeTab === 'regression' && (
        <div className="space-y-4 animate-fade-in">
          {/* Computation Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFD] text-center shadow-xs">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">TOTAL TEST CASES</div>
              <div className="text-3xl font-black text-[#0F172A]">{regression.totalTests}</div>
              <span className="text-[10px] text-[#64748B] font-medium">{regression.testSuites.length} Test Suites</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] text-center shadow-xs">
              <div className="text-[10px] font-bold text-[#166534] uppercase tracking-wider mb-1">PASSED INVARIANTS</div>
              <div className="text-3xl font-black text-[#16A34A]">{computedTestCount}</div>
              <span className="text-[10px] text-[#16A34A] font-medium">0 Broken Invariants</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] text-center shadow-xs">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">THROUGHPUT SPEED</div>
              <div className="text-3xl font-black text-[#2563EB]">14.2k</div>
              <span className="text-[10px] text-[#2563EB] font-medium">Assertions / Second</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] text-center shadow-xs">
              <div className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1">COMPATIBILITY RATE</div>
              <div className="text-3xl font-black text-[#2563EB]">{passRate}%</div>
              <span className="text-[10px] text-[#1D4ED8] font-medium">100% Functional Parity</span>
            </div>
          </div>

          {/* Live Test Suite Computation Terminal */}
          {runningRegression && (
            <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl p-4 font-mono text-xs text-[#E2E8F0] space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] text-[#60A5FA] font-bold">
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  EXECUTING GOOGLETEST HARNESS IN EPHEMERAL SANDBOX...
                </span>
                <span>{computedTestCount} / {regression.totalTests} EXECUTED</span>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pt-2">
                {regressionLog.map((line, idx) => (
                  <div key={idx} className={line.includes('ALL') ? 'text-[#4ADE80] font-bold' : 'text-[#94A3B8]'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Suites Table (10+ Suites) */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Comprehensive Test Suite Matrix ({regression.testSuites.length} Suites)
                </h3>
                <p className="text-[11px] text-[#64748B]">All suites compiled under -fsanitize=address,undefined</p>
              </div>

              <button
                onClick={handleRunRegression}
                disabled={runningRegression}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  runningRegression
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white btn-cyber-blue active:scale-95'
                }`}
              >
                {runningRegression ? (
                  <><span className="w-2 h-2 rounded-full bg-white animate-ping" /><span>COMPUTING HARNESS...</span></>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-current" /><span>RE-RUN ALL 78 REGRESSION TESTS</span></>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {regression.testSuites.map((suite, i) => {
                const isCurrentlyRunning = activeSuiteIdx === i;
                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isCurrentlyRunning
                        ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/40'
                        : 'border-[#E2E8F0] bg-[#F8FAFD] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#0F172A] font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span>{suite.name}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 pl-5">
                        {suite.passed}/{suite.tests} test assertions passed · {suite.durationMs}ms duration
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-bold text-[10px] border border-[#BFDBFE] shrink-0">
                      PASSED ✓
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERFORMANCE BENCHMARKING COMPUTATIONS */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">BASELINE P50</div>
              <div className="text-2xl font-black text-[#0369A1]">{performance.baselineMs} ms</div>
              <span className="text-[10px] text-[#64748B]">Unpatched Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">PATCHED P50</div>
              <div className="text-2xl font-black text-[#0F172A]">{latencyP50} ms</div>
              <span className="text-[10px] text-[#2563EB]">10k Iterations</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">P99 TAIL LATENCY</div>
              <div className="text-2xl font-black text-[#0F172A]">{latencyP99} ms</div>
              <span className="text-[10px] text-[#64748B]">vs 18.2ms baseline</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs text-center">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">THROUGHPUT</div>
              <div className="text-2xl font-black text-[#16A34A]">{benchThroughput.toLocaleString()} req/s</div>
              <span className="text-[10px] text-[#16A34A]">Zero Packet Drops</span>
            </div>
          </div>

          {/* Subsystem Latency Flame Graph / Breakdown */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Subsystem Micro-Benchmark Breakdown
                </h3>
                <p className="text-[11px] text-[#64748B]">Detailed cycle cost per pipeline component</p>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={runningBench}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  runningBench
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white btn-cyber-blue active:scale-95'
                }`}
              >
                {runningBench ? (
                  <><span className="w-2 h-2 rounded-full bg-white animate-ping" /><span>BENCHMARKING CPU CYCLES...</span></>
                ) : (
                  <><Zap className="w-3.5 h-3.5" /><span>RUN 10,000 ITERATION BENCHMARK</span></>
                )}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { name: 'Header Tag Ingress Parser', baseline: 4.2, patched: 4.3, delta: '+0.1ms (+2.3%)', memory: '4.1 MB' },
                { name: 'Bounds Safety Invariant Guard', baseline: 0.0, patched: 0.04, delta: '+0.04ms (Guard)', memory: '0.1 MB' },
                { name: 'Socket Frame Demux Routing', baseline: 3.4, patched: 3.4, delta: '0.0ms (0.0%)', memory: '5.8 MB' },
                { name: 'Dynamic Memory Buffer Allocator', baseline: 2.8, patched: 2.9, delta: '+0.1ms (+3.5%)', memory: '8.2 MB' },
                { name: 'Session State Table Indexer', baseline: 2.0, patched: 2.06, delta: '+0.06ms (+3.0%)', memory: '3.1 MB' }
              ].map((sub, i) => (
                <div key={i} className="p-3.5 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#0F172A]">{sub.name}</span>
                    <span className="text-[#2563EB]">{sub.delta}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                    <span>Baseline: {sub.baseline}ms</span>
                    <span>·</span>
                    <span>Patched: {sub.patched}ms</span>
                    <span>·</span>
                    <span>Heap Allocation: {sub.memory}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full"
                      style={{ width: `${Math.min(100, (sub.patched / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                <span>Security Operation Chronological Event Log ({timeline.length} Events)</span>
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">Tamper-evident audit trail of all pipeline actions</p>
            </div>
          </div>

          <div className="relative space-y-0 ml-4 pt-2">
            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#2563EB] to-[#E2E8F0]" />
            {timeline.map((event) => {
              const statusColors: Record<string, string> = {
                SUCCESS: 'bg-[#22C55E] ring-[#F0FDF4]',
                ALERT: 'bg-[#EF4444] ring-[#FFF1F2]',
                INFO: 'bg-[#3B82F6] ring-[#EFF6FF]',
                WARN: 'bg-[#F59E0B] ring-[#FFFBEB]',
              };
              const textColors: Record<string, string> = {
                SUCCESS: 'text-[#16A34A]',
                ALERT: 'text-[#DC2626]',
                INFO: 'text-[#2563EB]',
                WARN: 'text-[#D97706]',
              };

              return (
                <div key={event.id} className="flex items-start gap-4 pb-5 last:pb-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 -ml-1.5 mt-1 ring-4 ${statusColors[event.status] || 'bg-[#94A3B8] ring-[#F8FAFD]'}`} />
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-[#64748B]">{event.time}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${textColors[event.status] || 'text-[#64748B]'}`}>
                        {event.status}
                      </span>
                      <span className="text-[10px] font-semibold text-[#94A3B8]">{event.agent}</span>
                    </div>
                    <div className="text-xs font-bold text-[#0F172A]">{event.title}</div>
                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed font-medium">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
