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
  X
} from 'lucide-react';
import { playCyberBlip } from '../utils/audio';
import { NavView } from '../types';

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
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'command-center' as NavView, label: 'Command Center', icon: LayoutDashboard, badge: undefined },
    { id: 'live-operation' as NavView, label: 'Live Security Operation', icon: Activity, badge: 'ACTIVE', badgeColor: 'bg-[#F1F8EC] text-[#377218] border-[#D1E7C4]' },
    { id: 'project-intelligence' as NavView, label: 'Project Intelligence', icon: FolderGit2 },
    { id: 'vulnerabilities' as NavView, label: 'Vulnerability Center', icon: ShieldAlert, badge: `${confirmedVulnCount}`, badgeColor: 'bg-[#FDF2F4] text-[#B22D42] border-[#F7CDD4]' },
    { id: 'pov' as NavView, label: 'Proof of Vulnerability', icon: ShieldCheck, badge: '10/10', badgeColor: 'bg-[#FEF9F0] text-[#965B0C] border-[#F8E6C8]' },
    { id: 'patch-center' as NavView, label: 'Patch Center', icon: Wrench },
    { id: 'verification' as NavView, label: 'Independent Verification', icon: ShieldCheck, badge: 'PASS', badgeColor: 'bg-[#F0F8F3] text-[#17653B] border-[#C8E6D3]' },
    { id: 'break-my-patch' as NavView, label: 'Break My Patch', icon: Zap },
    { id: 'regression-performance' as NavView, label: 'Regression & Performance', icon: GitPullRequest },
    { id: 'time-machine' as NavView, label: 'Security Time Machine', icon: History },
    { id: 'agent-control' as NavView, label: 'Agent Control Center', icon: Bot, badge: '12', badgeColor: 'bg-[#F0F8F9] text-[#20626D] border-[#C7E5E9]' },
    { id: 'certificates' as NavView, label: 'Proof Certificates', icon: Award },
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
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
              isActive
                ? 'bg-[#F1F8EC] text-[#1E2621] font-bold shadow-2xs border border-[#D1E7C4]'
                : 'text-[#586459] hover:text-[#1E2621] hover:bg-[#FAFBF7]'
            }`}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            {/* Active Left Indicator Pill */}
            {isActive && (
              <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#43881E]" />
            )}

            <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-[#FFFFFF] text-[#43881E] shadow-2xs' : 'text-[#818D82]'}`}>
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
        className={`fixed inset-0 bg-[#1E2621]/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      >
        <div
          className={`w-72 max-w-[85vw] bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between p-4 border-r border-[#DFE4D8] transform transition-transform duration-200 ease-out overflow-y-auto ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DFE4D8]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43881E] animate-pulse" />
                <span className="font-bold text-sm text-[#1E2621]">SENTINEL NAVIGATION</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8] text-[#586459] hover:text-[#1E2621]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavList(true)}
          </div>

          {/* Mobile Footer Status */}
          <div className="pt-3 border-t border-[#DFE4D8] space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8]">
              <div className="flex items-center gap-2 text-[#43881E] font-bold text-[11px] mb-0.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>12 AI AGENTS ONLINE</span>
              </div>
              <span className="text-[10px] text-[#586459] block truncate">
                {llmProvider}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop Collapsible Sidebar */}
      <aside
        id="sentinel-sidebar"
        className={`hidden lg:flex flex-col justify-between bg-[#FFFFFF] border-r border-[#DFE4D8] p-3 transition-all duration-200 select-none z-10 shrink-0 h-full overflow-y-auto ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Nav List */}
        <div>
          {renderNavList(false)}
        </div>

        {/* Desktop Bottom Section: Collapse Toggle & System Status */}
        <div className="pt-3 border-t border-[#DFE4D8] space-y-2">
          {!collapsed && (
            <div className="p-3 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#818D82] font-semibold">
                <span>ORCHESTRATOR</span>
                <span className="flex items-center gap-1 text-[#377218] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43881E]" />
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#1E2621] truncate flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#43881E] shrink-0" />
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
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#FAFBF7] hover:bg-[#F1F8EC] border border-[#DFE4D8] text-[#586459] hover:text-[#1E2621] text-xs font-semibold transition-all shadow-2xs"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#43881E]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#43881E]" />
                <span>Collapse Panel</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
