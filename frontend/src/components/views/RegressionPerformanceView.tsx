import React, { useState } from 'react';
import {
  GitPullRequest,
  Activity,
  CheckCircle2,
  Play,
  RotateCcw,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { RegressionResult, PerformanceResult } from '../../types';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface RegressionPerformanceViewProps {
  regression: RegressionResult;
  performance: PerformanceResult;
  onNavigate: (view: any) => void;
}

export const RegressionPerformanceView: React.FC<RegressionPerformanceViewProps> = ({
  regression,
  performance,
  onNavigate
}) => {
  const [runningBench, setRunningBench] = useState(false);
  const [runningRegression, setRunningRegression] = useState(false);

  const handleRunRegression = () => {
    setRunningRegression(true);
    playCyberBlip(1000);
    setTimeout(() => {
      setRunningRegression(false);
      playSuccessChime();
    }, 900);
  };

  const handleRunBenchmark = () => {
    setRunningBench(true);
    playCyberBlip(1100);
    setTimeout(() => {
      setRunningBench(false);
      playSuccessChime();
    }, 1100);
  };

  return (
    <div id="regression-perf-view" className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
              SOFTWARE ASSURANCE & SLA AUDIT
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-wide mt-0.5">
              REGRESSION TESTS & PERFORMANCE BENCHMARKS
            </h2>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              Guarantees functional backwards compatibility and evaluates memory & latency overhead introduced by security invariant enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunRegression}
              disabled={runningRegression}
              className="px-4 py-2.5 rounded-[10px] bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{runningRegression ? 'EXECUTING TEST SUITE...' : 'RUN REGRESSION SUITE'}</span>
            </button>

            <button
              onClick={handleRunBenchmark}
              disabled={runningBench}
              className="px-4 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 fill-current" />
              <span>{runningBench ? 'PROFILING LATENCY...' : 'RUN PERF BENCHMARK'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Major Panels: Regression (Left) & Performance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: REGRESSION TESTS */}
        <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                REGRESSION TESTS
              </h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">
              STATUS: ALL TESTS PASSED
            </span>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">TOTAL TESTS</span>
              <span className="text-[#0F172A] font-black text-xl">{regression.totalTests}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">PASSED</span>
              <span className="text-[#2563EB] font-black text-xl">{regression.passed}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">FAILED</span>
              <span className="text-[#0F172A] font-black text-xl">{regression.failed}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">SKIPPED</span>
              <span className="text-[#0F172A] font-black text-xl">{regression.skipped}</span>
            </div>
          </div>

          {/* Detailed Test Suite Breakdown */}
          <div className="space-y-2 text-xs pt-2">
            <div className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">
              GOOGLE-TEST SUITE BREAKDOWN
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {regression.testSuites.map((suite, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] flex items-center justify-between hover:border-[#2563EB] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="text-[#0F172A] font-bold">{suite.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                    <span>{suite.passed}/{suite.tests} Passed</span>
                    <span className="text-[#2563EB] font-bold">{suite.durationMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: PERFORMANCE */}
        <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                PERFORMANCE PROFILING
              </h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">
              STATUS: {performance.status}
            </span>
          </div>

          {/* Major Latency Comparison Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">BASELINE LATENCY</span>
              <span className="text-[#0F172A] font-black text-xl">{performance.baselineMs} ms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">PATCHED LATENCY</span>
              <span className="text-[#0284C7] font-black text-xl">{performance.patchedMs} ms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px] block font-bold">IMPACT OVERHEAD</span>
              <span className="text-[#2563EB] font-black text-xl">+{performance.impactPercent}%</span>
            </div>
          </div>

          {/* Visual Latency Overhead Bars */}
          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Average Latency (100,000 requests)</span>
                <span className="text-[#0284C7] font-bold">12.4 ms vs 12.7 ms</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden flex">
                <div className="h-full bg-[#0284C7]" style={{ width: '49%' }} title="Baseline 12.4ms" />
                <div className="h-full bg-[#2563EB]" style={{ width: '51%' }} title="Patched 12.7ms" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">P99 Tail Latency</span>
                <span className="text-[#0284C7] font-bold">{performance.p99BaselineMs} ms vs {performance.p99PatchedMs} ms</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden flex">
                <div className="h-full bg-[#0284C7]" style={{ width: '49.5%' }} />
                <div className="h-full bg-[#2563EB]" style={{ width: '50.5%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Memory Footprint (RSS)</span>
                <span className="text-[#0284C7] font-bold">{performance.memoryBaselineMb} MB vs {performance.memoryPatchedMb} MB (+0.1MB)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden flex">
                <div className="h-full bg-[#2563EB]" style={{ width: '50%' }} />
                <div className="h-full bg-[#0284C7]" style={{ width: '50.2%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
