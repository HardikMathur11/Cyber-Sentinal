import React, { useState } from 'react';
import {
  History,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  Zap,
  GitPullRequest,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { TimelineEvent, SecurityRun } from '../../types';
import { playCyberBlip } from '../../utils/audio';

interface TimeMachineViewProps {
  timeline: TimelineEvent[];
  onNavigate: (view: any) => void;
}

export const TimeMachineView: React.FC<TimeMachineViewProps> = ({ timeline, onNavigate }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(timeline[timeline.length - 1]?.id || 'evt-13');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredEvents = timeline.filter((e) => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  const selectedEvent = timeline.find((e) => e.id === selectedEventId) || timeline[0];

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'STATIC':
      case 'POV':
      case 'FUZZ':
        return 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]';
      case 'PATCH':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      case 'VERIFY':
      case 'REGRESSION':
      case 'CERT':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'ADVERSARIAL':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      default:
        return 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]';
    }
  };

  return (
    <div id="time-machine-view" className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <History className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                CHRONOLOGICAL AUDIT LEDGER
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-wide mt-0.5">
                SECURITY TIME MACHINE
              </h2>
              <p className="text-xs text-[#475569] mt-1 font-medium">
                Explore every millisecond of autonomous reasoning: From initial reconnaissance to cryptographic proof certification.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {['ALL', 'STATIC', 'POV', 'PATCH', 'VERIFY', 'ADVERSARIAL', 'CERT'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playCyberBlip(700);
                  setCategoryFilter(cat);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  categoryFilter === cat
                    ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-sm'
                    : 'bg-[#F8FAFD] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Layout: Left Interactive Visual Line, Right Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chronological Timeline (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider pb-2 border-b border-[#E2E8F0] flex items-center justify-between">
            <span>CHRONOLOGICAL EVENTS ({filteredEvents.length})</span>
            <span>CLICK TO INSPECT STATE SNAPSHOT</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0] max-h-[640px] overflow-y-auto pr-2">
            {filteredEvents.map((evt, idx) => {
              const isSelected = selectedEventId === evt.id;
              const isAlert = evt.status === 'ALERT';
              const isSuccess = evt.status === 'SUCCESS';

              return (
                <div
                  key={evt.id}
                  id={`timeline-node-${evt.id}`}
                  onClick={() => {
                    playCyberBlip(800 + idx * 25);
                    setSelectedEventId(evt.id);
                  }}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF]/60 ring-1 ring-[#2563EB]/40 scale-[1.01]'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#2563EB] hover:bg-[#F8FAFD]'
                  }`}
                >
                  {/* Timeline Dot Node */}
                  <div
                    className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] ring-4 ring-[#2563EB]/30 scale-125'
                        : isAlert
                        ? 'bg-[#BE123C]'
                        : isSuccess
                        ? 'bg-[#2563EB]'
                        : 'bg-[#94A3B8]'
                    }`}
                  />

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#0284C7] font-bold text-xs">{evt.time}</span>
                      <span className="text-[#94A3B8]">•</span>
                      <span className="text-[#0F172A] font-bold text-xs">{evt.title}</span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${getCategoryBadgeStyle(
                        evt.category
                      )}`}
                    >
                      {evt.agent}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed font-medium">{evt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Deep-Dive Snapshot Inspector (5 Cols) */}
        {selectedEvent && (
          <div className="lg:col-span-5 bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-[14px] space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] text-xs">
              <span className="text-[#64748B] uppercase font-bold">EVENT SNAPSHOT INSPECTOR</span>
              <span className="text-[#0284C7] font-bold">[{selectedEvent.time}]</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
                <span className="text-[#64748B] text-[10px] uppercase block font-bold">EVENT TITLE & AGENT</span>
                <div className="text-[#0F172A] font-bold text-sm">{selectedEvent.title}</div>
                <div className="text-[#0284C7] text-xs font-semibold">{selectedEvent.agent}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
                <span className="text-[#64748B] text-[10px] uppercase block font-bold">OPERATIONAL LOG ENTRY</span>
                <p className="text-[#475569] leading-relaxed text-xs font-medium">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080C14] border border-[#1E2638] space-y-2 shadow-inner font-mono text-[#E6EDF3]">
                <span className="text-[#8B949E] text-[10px] uppercase block font-bold">STATE METADATA</span>
                <div className="text-[11px] space-y-1">
                  <div>• Category: <span className="text-[#79C0FF] font-bold">{selectedEvent.category}</span></div>
                  <div>• Status: <span className="text-[#7EE787] font-bold">{selectedEvent.status}</span></div>
                  <div>• Sandbox: <span className="text-[#D2A8FF] font-bold">Docker Isolated Tier 3</span></div>
                </div>
              </div>

              <button
                onClick={() => {
                  playCyberBlip(900);
                  if (selectedEvent.category === 'POV' || selectedEvent.category === 'FUZZ') {
                    onNavigate('pov');
                  } else if (selectedEvent.category === 'PATCH') {
                    onNavigate('patch-center');
                  } else if (selectedEvent.category === 'VERIFY') {
                    onNavigate('verification');
                  } else if (selectedEvent.category === 'ADVERSARIAL') {
                    onNavigate('break-my-patch');
                  } else if (selectedEvent.category === 'CERT') {
                    onNavigate('certificates');
                  } else {
                    onNavigate('live-operation');
                  }
                }}
                className="w-full py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Jump to Stage View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
