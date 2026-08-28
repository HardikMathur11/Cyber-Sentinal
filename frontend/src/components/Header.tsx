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
  isMobileSidebarOpen
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const notifications = [
    { id: 1, type: 'ALERT', text: 'VULN-001 (Stack Buffer Overflow) confirmed via PoV payload', time: '2m ago' },
    { id: 2, type: 'SUCCESS', text: 'Candidate Patch #2 passed 1,250 adversarial mutation rounds', time: '1m ago' },
    { id: 3, type: 'INFO', text: 'Proof Certificate SC-2026-001847 generated with SHA-256 seal', time: 'Just now' },
  ];

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playCyberBlip(1200);
  };

  const getSafetyBadgeStyle = (mode: SafetyMode) => {
    switch (mode) {
      case 'OBSERVE':
        return 'bg-[#F0F8F9] text-[#20626D] border-[#C7E5E9]';
      case 'ASSIST':
        return 'bg-[#FEF9F0] text-[#965B0C] border-[#F8E6C8]';
      case 'AUTONOMOUS':
        return 'bg-[#F1F8EC] text-[#377218] border-[#D1E7C4]';
    }
  };

  return (
    <header
      id="sentinel-header"
      className="h-16 bg-[#FFFFFF] border-b border-[#DFE4D8] px-3 sm:px-5 lg:px-7 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-colors font-sans shadow-xs w-full select-none"
    >
      {/* Left Section: Brand Logo & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Toggle (Visible only on < lg screens) */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] text-[#1E2621] hover:bg-[#F1F8EC] transition-all shadow-2xs shrink-0 active:scale-95"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? (
            <X className="w-4 h-4 text-[#43881E]" />
          ) : (
            <Menu className="w-4 h-4 text-[#1E2621]" />
          )}
        </button>

        {/* Website Logo & Clean Title with Zero Gap */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F1F8EC] border border-[#D1E7C4] flex items-center justify-center shrink-0 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#43881E] animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1E2621] flex items-center">
              <span className="text-[#43881E]">SENTINEL</span>
              <span className="text-[#1E2621]">-CHAIN</span>
            </h1>

            <span className="hidden xl:inline-block text-xs font-semibold text-[#586459] border-l border-[#DFE4D8] pl-2.5 py-0.5 tracking-tight">
              Autonomous Cyber-Reasoning & Verified Remediation
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Status Pill & Safety Policy Mode (Desktop View) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Active Agents Badge */}
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43881E] animate-ping" />
          12 AGENTS ACTIVE
        </span>

        {/* Safety Mode Selector */}
        <div className="flex items-center gap-1 bg-[#FAFBF7] border border-[#DFE4D8] rounded-xl p-1 text-xs shadow-2xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#586459] px-2">
            <Lock className="w-3 h-3 text-[#43881E]" />
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
                  : 'text-[#818D82] hover:text-[#1E2621] hover:bg-[#F1F8EC]/50'
              }`}
            >
              {mode === 'AUTONOMOUS' ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#43881E]" />
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
        {/* Mobile Safety Mode Dropdown (< lg) */}
        <div className="lg:hidden relative shrink-0">
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold shadow-2xs ${getSafetyBadgeStyle(
              safetyMode
            )}`}
            title="Change Safety Policy Mode"
          >
            <Lock className="w-3 h-3" />
            <span>{safetyMode === 'AUTONOMOUS' ? 'AUTO' : safetyMode}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showModeDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[#FFFFFF] border border-[#DFE4D8] rounded-xl shadow-lg p-1.5 z-50 space-y-1">
              {(['OBSERVE', 'ASSIST', 'AUTONOMOUS'] as SafetyMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    playCyberBlip(800);
                    onSelectSafetyMode(mode);
                    setShowModeDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    safetyMode === mode
                      ? `${getSafetyBadgeStyle(mode)} border`
                      : 'text-[#586459] hover:bg-[#FAFBF7]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Guide & Agent Status Modal Button */}
        {onOpenGuide && (
          <button
            onClick={() => {
              playCyberBlip(950);
              onOpenGuide();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F0F8F9] hover:bg-[#E5F4F6] border border-[#C7E5E9] text-[#20626D] text-xs font-semibold shadow-2xs transition-all active:scale-95 shrink-0"
            title="Open Module Purpose Guide and Test Live AI / Agents"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#2E7F8C]" />
            <span className="hidden sm:inline">Guide & Status</span>
            <span className="sm:hidden text-[11px]">Guide</span>
          </button>
        )}

        {/* Trigger Demo / Reset Button */}
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
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 ${
            isRunningDemo
              ? 'bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] cursor-wait'
              : 'bg-[#43881E] hover:bg-[#377218] text-white'
          }`}
          title="Trigger full 12-stage multi-agent demo pipeline"
        >
          {isRunningDemo ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#43881E] animate-ping" />
              <span className="hidden sm:inline">RUNNING...</span>
              <span className="sm:hidden text-[10px]">RUN...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">RUN SENTINEL DEMO</span>
              <span className="sm:hidden text-[11px]">DEMO</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={handleSoundToggle}
          className={`p-2 rounded-xl border transition-all shrink-0 ${
            soundOn
              ? 'bg-[#FAFBF7] border-[#DFE4D8] text-[#43881E] hover:bg-[#F1F8EC]'
              : 'bg-[#FAFBF7] border-[#DFE4D8] text-[#818D82] hover:bg-[#F3F6EE]'
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
            className="p-2 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] text-[#586459] hover:text-[#1E2621] hover:bg-[#F1F8EC] transition-all relative"
            title="Live Security Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9485D] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-88 bg-[#FFFFFF] border border-[#DFE4D8] rounded-2xl shadow-xl p-4 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DFE4D8]">
                <span className="font-bold text-[#1E2621] uppercase tracking-wider text-[11px]">
                  Live Telemetry Alerts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4] font-semibold">
                  3 Events
                </span>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] flex items-start gap-2.5"
                  >
                    {n.type === 'ALERT' && <ShieldAlert className="w-4 h-4 text-[#D9485D] shrink-0 mt-0.5" />}
                    {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-[#43881E] shrink-0 mt-0.5" />}
                    {n.type === 'INFO' && <Sparkles className="w-4 h-4 text-[#2E7F8C] shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1E2621] text-xs font-medium leading-snug break-words">{n.text}</p>
                      <span className="text-[10px] text-[#818D82] mt-0.5 block">{n.time}</span>
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
