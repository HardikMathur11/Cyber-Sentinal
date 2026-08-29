import React from 'react';
import {
  LayoutDashboard,
  Activity,
  FolderGit2,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  Zap,
  GitPullRequest,
  History,
  Bot,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Box,
  Cpu,
  X,
  Lock,
  Play,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { playCyberBlip } from '../utils/audio';
import { NavView, SafetyMode } from '../types';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeRunCount?: number;
  confirmedVulnCount?: number;
  llmProvider: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  safetyMode?: SafetyMode;
  onSelectSafetyMode?: (mode: SafetyMode) => void;
  onTriggerDemo?: () => void;
  isRunningDemo?: boolean;
  onOpenGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  activeRunCount = 1,
  confirmedVulnCount = 1,
  llmProvider,
  isMobileOpen = false,
  onCloseMobile,
  safetyMode = 'AUTONOMOUS',
  onSelectSafetyMode,
  onTriggerDemo,
  isRunningDemo = false,
  onOpenGuide
}) => {
  const menuItems = [
    {
      id: 'command-center' as NavView, label: 'Command Center', icon: LayoutDashboard,
      badge: undefined, description: 'Dashboard & live feed'
    },
    {
      id: 'live-operation' as NavView, label: 'Live Operations', icon: Activity,
      badge: 'LIVE', badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      description: 'Pipeline + Agent status'
    },
    {
      id: 'project-intelligence' as NavView, label: 'Project Intelligence', icon: FolderGit2,
      description: 'Upload & scan projects'
    },
    {
      id: 'vulnerabilities' as NavView, label: 'Vulnerabilities & PoV', icon: ShieldAlert,
      badge: `${confirmedVulnCount}`, badgeColor: 'bg-[#FDF2F4] text-[#B22D42] border-[#F7CDD4]',
      description: 'Findings + proof of vuln'
    },
    {
      id: 'patch-center' as NavView, label: 'Patch & Verification', icon: Wrench,
      badge: 'PASS', badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      description: 'Patch gen, test & verify'
    },
    {
      id: 'analytics' as NavView, label: 'Analytics & History', icon: GitPullRequest,
      description: 'Regression, perf, timeline'
    },
    {
      id: 'agent-control' as NavView, label: 'Agent Control', icon: Bot,
      badge: '12', badgeColor: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
      description: '12 autonomous agents'
    },
    {
      id: 'certificates' as NavView, label: 'Proof Certificates', icon: Award,
      description: 'Cryptographic seals'
    },
  ];

  const renderNavList = (isMobile: boolean = false) => (
    <div className="space-y-1 py-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              playCyberBlip(1000);
              onSelectView(item.id);
              if (isMobile && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group ${
              isActive
                ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-[0_2px_12px_rgba(37,99,235,0.08)] border border-[#BFDBFE]'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFD] hover:translate-x-0.5'
            }`}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            {/* Active Left Indicator Pill */}
            {isActive && (
              <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]" />
            )}

            <div className={`p-1.5 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-[#FFFFFF] text-[#2563EB] shadow-2xs scale-105' : 'text-[#64748B] group-hover:text-[#2563EB]'}`}>
              <Icon className="w-4 h-4" />
            </div>

            {(!collapsed || isMobile) && (
              <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Mobile & Tablet Slide-Over Drawer with Backdrop */}
      <div
        className={`fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      >
        <div
          className={`w-72 max-w-[85vw] bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between p-4 border-r border-[#E2E8F0] transform transition-transform duration-200 ease-out overflow-y-auto ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
                <span className="font-bold text-sm text-[#0F172A]">CYBER SENTINEL NAV</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Mobile Actions & Policy Control Hub */}
            <div className="my-2.5 p-3 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#2563EB]" />
                  <span>Safety Policy</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  {safetyMode}
                </span>
              </div>

              {/* Policy Selector Buttons */}
              {onSelectSafetyMode && (
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-center shadow-2xs">
                  {(['OBSERVE', 'ASSIST', 'AUTONOMOUS'] as SafetyMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        playCyberBlip(800);
                        onSelectSafetyMode(mode);
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        safetyMode === mode
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      {mode === 'AUTONOMOUS' ? 'AUTO' : mode}
                    </button>
                  ))}
                </div>
              )}

              {/* Run Sentinel Demo Trigger */}
              {onTriggerDemo && (
                <button
                  onClick={() => {
                    playCyberBlip(1100);
                    onTriggerDemo();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  disabled={isRunningDemo}
                  className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isRunningDemo
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] cursor-wait'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  }`}
                >
                  {isRunningDemo ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
                      <span>PIPELINE RUNNING...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>RUN SENTINEL DEMO</span>
                    </>
                  )}
                </button>
              )}

              {/* System Guide Trigger */}
              {onOpenGuide && (
                <button
                  onClick={() => {
                    playCyberBlip(950);
                    onOpenGuide();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>System Guide & Status</span>
                </button>
              )}
            </div>

            {renderNavList(true)}
          </div>

          {/* Mobile Footer Status */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-[#2563EB] font-bold text-[11px] mb-0.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>12 AI AGENTS ONLINE</span>
              </div>
              <span className="text-[10px] text-[#475569] block truncate">
                {llmProvider}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop Collapsible Sidebar */}
      <aside
        id="sentinel-sidebar"
        className={`hidden lg:flex flex-col justify-between bg-[#FFFFFF] border-r border-[#E2E8F0] p-3 transition-all duration-200 select-none z-10 shrink-0 h-full overflow-y-auto ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Nav List */}
        <div>
          {renderNavList(false)}
        </div>

        {/* Desktop Bottom Section: Collapse Toggle & System Status */}
        <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
          {!collapsed && (
            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#64748B] font-semibold">
                <span>ORCHESTRATOR</span>
                <span className="flex items-center gap-1 text-[#1D4ED8] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span className="truncate">{llmProvider}</span>
              </div>
            </div>
          )}

          {/* Collapse / Expand Button */}
          <button
            onClick={() => {
              playCyberBlip(800);
              onToggleCollapse();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-xs font-semibold transition-all shadow-2xs"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#2563EB]" />
                <span>Collapse Panel</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
