import React, { useState } from 'react';
import {
  ShieldAlert,
  Shield,
  Play,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Lock,
  Sparkles,
  Info,
  Sun,
  Moon,
  HelpCircle,
  Cpu,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { SafetyMode } from '../types';
import { isSoundEnabled, toggleSound, playCyberBlip } from '../utils/audio';

interface HeaderProps {
  safetyMode: SafetyMode;
  onSelectSafetyMode: (mode: SafetyMode) => void;
  onTriggerDemo: () => void;
  isRunningDemo: boolean;
  onResetDemo?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenGuide?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onNavigate?: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  safetyMode,
  onSelectSafetyMode,
  onTriggerDemo,
  isRunningDemo,
  onResetDemo,
  theme = 'light',
  onToggleTheme,
  onOpenGuide,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onNavigate
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const notifications = [
    { id: 1, type: 'ALERT', text: 'VULN-001 (Stack Buffer Overflow) confirmed via PoV payload', time: '2m ago', target: 'vulnerabilities' },
    { id: 2, type: 'SUCCESS', text: 'Candidate Patch #2 passed 1,250 adversarial mutation rounds', time: '1m ago', target: 'patch-center' },
    { id: 3, type: 'INFO', text: 'Proof Certificate SC-2026-001847 generated with SHA-256 seal', time: 'Just now', target: 'certificates' },
    { id: 4, type: 'ALERT', text: 'VULN-003 (Use-After-Free in Session Table) discovered at session_manager.cpp:204', time: '4m ago', target: 'vulnerabilities' },
    { id: 5, type: 'SUCCESS', text: 'GoogleTest Suite: 78 / 78 test cases verified clean (0 regressions)', time: '5m ago', target: 'analytics' },
  ];

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playCyberBlip(1200);
  };

  const getSafetyBadgeStyle = (mode: SafetyMode) => {
    switch (mode) {
      case 'OBSERVE':
        return 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]';
      case 'ASSIST':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'AUTONOMOUS':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
    }
  };

  return (
    <header
      id="sentinel-header"
      className="h-14 sm:h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-2.5 sm:px-5 lg:px-7 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-colors font-sans shadow-xs w-full select-none"
    >
      {/* Left Section: Brand Logo & Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Hamburger Toggle (Visible only on < lg screens) */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#EFF6FF] transition-all shadow-2xs shrink-0 active:scale-95"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? (
            <X className="w-4 h-4 text-[#2563EB]" />
          ) : (
            <Menu className="w-4 h-4 text-[#0F172A]" />
          )}
        </button>

        {/* Website Logo & Clean Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-base md:text-lg font-black tracking-tight flex items-center gap-1">
              <span className="text-shine-cobalt font-black">CYBER</span>
              <span className="text-[#0F172A]">SENTINEL</span>
            </h1>

            <span className="hidden xl:inline-block text-xs font-semibold text-[#475569] border-l border-[#E2E8F0] pl-2.5 py-0.5 tracking-tight">
              Autonomous Cyber-Reasoning & Verified Remediation
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Status Pill & Safety Policy Mode (Desktop View) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Active Agents Badge */}
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" />
          12 AGENTS ACTIVE
        </span>

        {/* Safety Mode Selector */}
        <div className="flex items-center gap-1 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl p-1 text-xs shadow-2xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#475569] px-2">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            <span>Policy:</span>
          </span>

          {(['OBSERVE', 'ASSIST', 'AUTONOMOUS'] as SafetyMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                playCyberBlip(800);
                onSelectSafetyMode(mode);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                safetyMode === mode
                  ? `${getSafetyBadgeStyle(mode)} border font-bold shadow-2xs`
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#EFF6FF]/50'
              }`}
            >
              {mode === 'AUTONOMOUS' ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  <span>AUTONOMOUS</span>
                </span>
              ) : (
                mode
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Action Buttons & Utilities */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Guide & Agent Status Modal Button (Desktop/Tablet) */}
        {onOpenGuide && (
          <button
            onClick={() => {
              playCyberBlip(950);
              onOpenGuide();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-semibold shadow-2xs transition-all active:scale-95 shrink-0"
            title="Open Module Purpose Guide and Test Live AI / Agents"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Guide & Status</span>
          </button>
        )}

        {/* Trigger Demo / Reset Button (Desktop/Tablet) */}
        <button
          onClick={() => {
            playCyberBlip(1100);
            if (isRunningDemo && onResetDemo) {
              onResetDemo();
            } else {
              onTriggerDemo();
            }
          }}
          disabled={isRunningDemo}
          className={`hidden sm:flex px-4 py-2 rounded-xl font-bold text-xs items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 btn-cyber-blue ${
            isRunningDemo
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)]'
          }`}
          title="Trigger full 12-stage multi-agent demo pipeline"
        >
          {isRunningDemo ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
              <span>RUNNING...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN SENTINEL DEMO</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={handleSoundToggle}
          className={`p-2 rounded-xl border transition-all shrink-0 ${
            soundOn
              ? 'bg-[#F8FAFD] border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF]'
              : 'bg-[#F8FAFD] border-[#E2E8F0] text-[#64748B] hover:bg-[#F0F4FA]'
          }`}
          title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              playCyberBlip(900);
              setShowNotifications(!showNotifications);
            }}
            className="p-2 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#EFF6FF] transition-all relative"
            title="Live Security Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-88 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                  Live Telemetry Alerts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-semibold">
                  3 Events
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      playCyberBlip(950);
                      setShowNotifications(false);
                      if (onNavigate) onNavigate(n.target);
                    }}
                    className="p-2.5 rounded-xl bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#93C5FD] flex items-start gap-2.5 cursor-pointer transition-all active:scale-[0.98] group"
                    title="Click to view details"
                  >
                    {n.type === 'ALERT' && <ShieldAlert className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />}
                    {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />}
                    {n.type === 'INFO' && <Sparkles className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0F172A] text-xs font-medium leading-snug break-words group-hover:text-[#2563EB] transition-colors">{n.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-[#64748B]">{n.time}</span>
                        <span className="text-[10px] font-bold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
