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
        return 'bg-[#FBE7EA] text-[#C62F49] border-[#F1B8C2]';
      case 'PATCH':
        return 'bg-[#EAF4DF] text-[#4F8F1D] border-[#C7DEB5]';
      case 'VERIFY':
      case 'REGRESSION':
      case 'CERT':
        return 'bg-[#E8F5EA] text-[#19734A] border-[#B9DEC1]';
      case 'ADVERSARIAL':
        return 'bg-[#FFF1D6] text-[#A96808] border-[#F0D39D]';
      default:
        return 'bg-[#E5F4F3] text-[#267982] border-[#B8DEDB]';
    }
  };

  return (
    <div id="time-machine-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5F4F3] border border-[#B8DEDB] flex items-center justify-center text-[#267982] shadow-sm">
              <History className="w-5 h-5 text-[#2D9AA6]" />
            </div>
            <div>
              <div className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-[#2D9AA6]">
                CHRONOLOGICAL AUDIT LEDGER
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#202923] font-mono-tech tracking-wide mt-0.5">
                SECURITY TIME MACHINE
              </h2>
              <p className="text-xs text-[#687168] mt-1 font-medium">
                Explore every millisecond of autonomous reasoning: From initial reconnaissance to cryptographic proof certification.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-[10px]">
            {['ALL', 'STATIC', 'POV', 'PATCH', 'VERIFY', 'ADVERSARIAL', 'CERT'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playCyberBlip(700);
                  setCategoryFilter(cat);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  categoryFilter === cat
                    ? 'bg-[#4F9D18] text-white border border-[#4F9D18] shadow-sm'
                    : 'bg-[#FAF8EE] text-[#536053] hover:text-[#202923] border border-[#DDE0D5]'
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
        <div className="lg:col-span-7 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] space-y-4 shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
          <div className="text-xs font-mono-tech font-bold text-[#687168] uppercase tracking-wider pb-2 border-b border-[#DCDDD2] flex items-center justify-between">
            <span>CHRONOLOGICAL EVENTS ({filteredEvents.length})</span>
            <span>CLICK TO INSPECT STATE SNAPSHOT</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CBD2C4] max-h-[640px] overflow-y-auto pr-2">
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
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer font-mono-tech shadow-sm ${
                    isSelected
                      ? 'border-[#4F9D18] bg-[#FAF8EE] ring-1 ring-[#4F9D18]/40 scale-[1.01]'
                      : 'border-[#DDE0D5] bg-[#FFFDF5] hover:border-[#4F9D18] hover:bg-[#FAF8EE]'
                  }`}
                >
                  {/* Timeline Dot Node */}
                  <div
                    className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                      isSelected
                        ? 'bg-[#4F9D18] ring-4 ring-[#4F9D18]/30 scale-125'
                        : isAlert
                        ? 'bg-[#E54862]'
                        : isSuccess
                        ? 'bg-[#15945E]'
                        : 'bg-[#899189]'
                    }`}
                  />

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2D9AA6] font-bold text-xs">{evt.time}</span>
                      <span className="text-[#899189]">•</span>
                      <span className="text-[#202923] font-bold text-xs">{evt.title}</span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${getCategoryBadgeStyle(
                        evt.category
                      )}`}
                    >
                      {evt.agent}
                    </span>
                  </div>

                  <p className="text-xs text-[#59635A] font-sans leading-relaxed font-medium">{evt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Deep-Dive Snapshot Inspector (5 Cols) */}
        {selectedEvent && (
          <div className="lg:col-span-5 bg-[#FFFDF5] p-6 border border-[#DDE0D5] rounded-[14px] space-y-4 shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCDDD2] font-mono-tech text-xs">
              <span className="text-[#687168] uppercase font-bold">EVENT SNAPSHOT INSPECTOR</span>
              <span className="text-[#2D9AA6] font-bold">[{selectedEvent.time}]</span>
            </div>

            <div className="space-y-3 font-mono-tech text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
                <span className="text-[#687168] text-[10px] uppercase block font-bold">EVENT TITLE & AGENT</span>
                <div className="text-[#202923] font-bold text-sm">{selectedEvent.title}</div>
                <div className="text-[#2D9AA6] text-xs font-semibold">{selectedEvent.agent}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
                <span className="text-[#687168] text-[10px] uppercase block font-bold">OPERATIONAL LOG ENTRY</span>
                <p className="text-[#59635A] leading-relaxed font-sans text-xs font-medium">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F1F0E9] border border-[#D5D8CF] space-y-2 shadow-inner">
                <span className="text-[#687168] text-[10px] uppercase block font-bold">STATE METADATA</span>
                <div className="text-[11px] text-[#29332C] space-y-1">
                  <div>• Category: <span className="text-[#202923] font-bold">{selectedEvent.category}</span></div>
                  <div>• Status: <span className="text-[#15945E] font-bold">{selectedEvent.status}</span></div>
                  <div>• Sandbox: <span className="text-[#2D9AA6] font-bold">Docker Isolated Tier 3</span></div>
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
                className="w-full py-2.5 rounded-[10px] bg-[#4F9D18] hover:bg-[#3F8414] active:bg-[#356F12] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_6px_rgba(45,70,30,0.10)]"
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
