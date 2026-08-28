import React from 'react';
import {
  Upload,
  Compass,
  ShieldAlert,
  Search,
  Cpu,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  Zap,
  GitPullRequest,
  Activity,
  Award,
  AlertTriangle,
  XCircle,
  Loader2
} from 'lucide-react';
import { PipelineStage, StageStatus, PipelineStageId } from '../types';
import { playCyberBlip } from '../utils/audio';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  currentStageId?: PipelineStageId;
  onSelectStage?: (stageId: PipelineStageId) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stages,
  currentStageId,
  onSelectStage,
  orientation = 'horizontal'
}) => {
  const getStageIcon = (id: PipelineStageId) => {
    switch (id) {
      case 'upload':
        return Upload;
      case 'recon':
        return Compass;
      case 'attack_surface':
        return ShieldAlert;
      case 'static_analysis':
        return Search;
      case 'fuzzing':
        return Cpu;
      case 'pov':
        return AlertTriangle;
      case 'patch':
        return Wrench;
      case 'verify':
        return ShieldCheck;
      case 'break_my_patch':
        return Zap;
      case 'regression':
        return GitPullRequest;
      case 'performance':
        return Activity;
      case 'certificate':
        return Award;
      default:
        return CheckCircle2;
    }
  };

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'running':
        return {
          border: 'border-[#43881E] ring-2 ring-[#43881E]/30',
          bg: 'bg-[#F1F8EC] text-[#377218] shadow-sm',
          line: 'bg-[#43881E] animate-pulse',
          badgeText: 'RUNNING',
          badgeBg: 'bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] animate-pulse'
        };
      case 'success':
        return {
          border: 'border-[#C8E6D3]',
          bg: 'bg-[#F0F8F3] text-[#17653B]',
          line: 'bg-[#1E824C]',
          badgeText: 'PASS',
          badgeBg: 'bg-[#F0F8F3] text-[#17653B] border border-[#C8E6D3]'
        };
      case 'failed':
        return {
          border: 'border-[#F7CDD4]',
          bg: 'bg-[#FDF2F4] text-[#B22D42]',
          line: 'bg-[#D9485D]',
          badgeText: 'FAIL',
          badgeBg: 'bg-[#FDF2F4] text-[#B22D42] border border-[#F7CDD4]'
        };
      case 'warning':
        return {
          border: 'border-[#F8E6C8]',
          bg: 'bg-[#FEF9F0] text-[#965B0C]',
          line: 'bg-[#C27918]',
          badgeText: 'WARN',
          badgeBg: 'bg-[#FEF9F0] text-[#965B0C] border border-[#F8E6C8]'
        };
      default:
        return {
          border: 'border-[#DFE4D8]',
          bg: 'bg-[#FAFBF7] text-[#818D82]',
          line: 'bg-[#DFE4D8]',
          badgeText: 'WAIT',
          badgeBg: 'bg-[#FAFBF7] text-[#818D82] border border-[#DFE4D8]'
        };
    }
  };

  return (
    <div id="pipeline-visualizer" className="w-full font-sans">
      {/* Horizontal Flow with Smooth Scroll on Mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 px-1 no-scrollbar scroll-smooth">
        {stages.map((stage, idx) => {
          const Icon = getStageIcon(stage.id);
          const style = getStatusBadge(stage.status);
          const isSelected = currentStageId === stage.id;
          const isLast = idx === stages.length - 1;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Node */}
              <button
                id={`pipeline-stage-${stage.id}`}
                onClick={() => {
                  playCyberBlip(750 + idx * 30);
                  if (onSelectStage) onSelectStage(stage.id);
                }}
                className={`group relative flex flex-col items-center min-w-[90px] sm:min-w-[100px] p-2.5 rounded-2xl border transition-all text-center shrink-0 ${
                  isSelected
                    ? 'border-[#43881E] bg-[#FFFFFF] shadow-md scale-105 z-10 ring-2 ring-[#43881E]/30'
                    : 'border-[#DFE4D8] bg-[#FFFFFF] hover:border-[#43881E]/50 hover:bg-[#FAFBF7]'
                }`}
              >
                {/* Icon Capsule */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border mb-1.5 transition-all ${
                    style.border
                  } ${style.bg} ${isSelected ? 'scale-110' : ''}`}
                >
                  {stage.status === 'running' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#43881E]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Stage Short Title */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2621] truncate max-w-[85px]">
                  {stage.shortName}
                </span>

                {/* Status Pill */}
                <span className={`text-[8px] px-1.5 py-0.5 mt-1 rounded-md font-bold uppercase tracking-tight ${style.badgeBg}`}>
                  {stage.status}
                </span>
              </button>

              {/* Connector line between stages */}
              {!isLast && (
                <div className="shrink-0 flex items-center justify-center w-2.5 sm:w-3.5">
                  <div className={`h-0.5 w-full rounded-full transition-colors ${style.line}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
