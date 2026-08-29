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
          border: 'border-[#2563EB] ring-2 ring-[#2563EB]/30',
          bg: 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm',
          line: 'bg-[#2563EB] animate-pulse',
          badgeText: 'RUNNING',
          badgeBg: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] animate-pulse'
        };
      case 'success':
        return {
          border: 'border-[#BFDBFE]',
          bg: 'bg-[#EFF6FF] text-[#1D4ED8]',
          line: 'bg-[#2563EB]',
          badgeText: 'PASS',
          badgeBg: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
        };
      case 'failed':
        return {
          border: 'border-[#FECDD3]',
          bg: 'bg-[#FFF1F2] text-[#BE123C]',
          line: 'bg-[#E11D48]',
          badgeText: 'FAIL',
          badgeBg: 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
        };
      case 'warning':
        return {
          border: 'border-[#FDE68A]',
          bg: 'bg-[#FFFBEB] text-[#B45309]',
          line: 'bg-[#D97706]',
          badgeText: 'WARN',
          badgeBg: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
        };
      default:
        return {
          border: 'border-[#E2E8F0]',
          bg: 'bg-[#F8FAFD] text-[#64748B]',
          line: 'bg-[#E2E8F0]',
          badgeText: 'WAIT',
          badgeBg: 'bg-[#F8FAFD] text-[#64748B] border border-[#E2E8F0]'
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
                className={`group relative flex flex-col items-center min-w-[90px] sm:min-w-[100px] p-2.5 rounded-2xl border transition-all duration-200 text-center shrink-0 active:scale-95 ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(37,99,235,0.18)] scale-105 z-10 ring-2 ring-[#2563EB]/40'
                    : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#2563EB]/60 hover:bg-[#F8FAFD] hover:-translate-y-0.5 hover:shadow-sm'
                }`}
              >
                {/* Icon Capsule */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border mb-1.5 transition-all duration-200 ${
                    style.border
                  } ${style.bg} ${isSelected ? 'scale-110 shadow-xs' : 'group-hover:scale-105'}`}
                >
                  {stage.status === 'running' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Stage Short Title */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A] truncate max-w-[85px] group-hover:text-[#2563EB]">
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
