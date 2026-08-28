import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_SECURITY_RUN } from './mockData';
import { NavView, SafetyMode, SecurityRun, PipelineStageId, StageStatus } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SystemGuideModal } from './components/SystemGuideModal';
import { CommandCenterView } from './components/views/CommandCenterView';
import { LiveOperationView } from './components/views/LiveOperationView';
import { ProjectIntelligenceView } from './components/views/ProjectIntelligenceView';
import { VulnerabilityCenterView } from './components/views/VulnerabilityCenterView';
import { ProofOfVulnerabilityView } from './components/views/ProofOfVulnerabilityView';
import { PatchCenterView } from './components/views/PatchCenterView';
import { IndependentVerificationView } from './components/views/IndependentVerificationView';
import { BreakMyPatchView } from './components/views/BreakMyPatchView';
import { RegressionPerformanceView } from './components/views/RegressionPerformanceView';
import { TimeMachineView } from './components/views/TimeMachineView';
import { AgentControlCenterView } from './components/views/AgentControlCenterView';
import { ProofCertificatesView } from './components/views/ProofCertificatesView';
import { playCyberBlip, playSuccessChime } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('command-center');
  const [securityRun, setSecurityRun] = useState<SecurityRun>(INITIAL_SECURITY_RUN);
  const [activePatchIndex, setActivePatchIndex] = useState<number>(0);
  const [safetyMode, setSafetyMode] = useState<SafetyMode>('AUTONOMOUS');
  const [isSimulatingLiveRun, setIsSimulatingLiveRun] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Dynamic API Base URL (defaults to Render backend when deployed)
  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? ''
      : 'https://army-system-09oo.onrender.com');

  // Connect WebSocket to real-time execution backend
  useEffect(() => {
    let wsUrl = '';
    const backendEnv =
      import.meta.env.VITE_BACKEND_URL ||
      (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? ''
        : 'https://army-system-09oo.onrender.com');

    if (backendEnv) {
      const wsProtocol = backendEnv.startsWith('https') ? 'wss:' : 'ws:';
      const cleanHost = backendEnv.replace(/^https?:\/\//, '').replace(/\/$/, '');
      wsUrl = `${wsProtocol}//${cleanHost}/ws/runs`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsPort = window.location.port === '3000' ? '3001' : (window.location.port || '3001');
      wsUrl = `${protocol}//${window.location.hostname}:${wsPort}/ws/runs`;
    }

    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'STATE_SNAPSHOT') {
            setSecurityRun(msg.payload);
          } else if (msg.type === 'STAGE_UPDATE') {
            const { stageId, status, summary } = msg.payload;
            playCyberBlip(800);
            setSecurityRun((prev) => ({
              ...prev,
              currentStage: stageId as PipelineStageId,
              stages: prev.stages.map((stg) => {
                if (stg.id === stageId) {
                  return { ...stg, status, outputSummary: summary || stg.outputSummary };
                }
                return stg;
              })
            }));
          } else if (msg.type === 'LOG_EMITTED') {
            setSecurityRun((prev) => ({
              ...prev,
              logs: [msg.payload, ...prev.logs]
            }));
          } else if (msg.type === 'RUN_COMPLETED') {
            setIsSimulatingLiveRun(false);
            playSuccessChime();
            setSecurityRun((prev) => ({
              ...prev,
              overallStatus: 'VERIFIED',
              stages: prev.stages.map((stg) => ({ ...stg, status: 'success' }))
            }));
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Sync theme class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleTriggerDemo = async () => {
    if (isSimulatingLiveRun) return;
    setIsSimulatingLiveRun(true);
    playCyberBlip(1200);
    setCurrentView('live-operation');

    try {
      const res = await fetch(`${API_BASE}/api/runs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safetyMode })
      });
      if (!res.ok) {
        simulateClientDemo();
      }
    } catch (e) {
      console.warn('Backend unavailable, running local simulation fallback.');
      simulateClientDemo();
    }
  };

  const simulateClientDemo = () => {
    const stageSequence: PipelineStageId[] = [
      'upload', 'recon', 'attack_surface', 'static_analysis',
      'fuzzing', 'pov', 'patch', 'verify',
      'break_my_patch', 'regression', 'performance', 'certificate'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx >= stageSequence.length) {
        clearInterval(interval);
        setIsSimulatingLiveRun(false);
        playSuccessChime();
        setSecurityRun((prev) => ({
          ...prev,
          overallStatus: 'VERIFIED',
          stages: prev.stages.map((stg) => ({ ...stg, status: 'success' }))
        }));
        return;
      }

      const stageId = stageSequence[currentIdx];
      playCyberBlip(800 + currentIdx * 30);
      setSecurityRun((prev) => ({
        ...prev,
        currentStage: stageId,
        stages: prev.stages.map((stg, sIdx) => {
          if (sIdx < currentIdx) return { ...stg, status: 'success' as StageStatus };
          if (sIdx === currentIdx) return { ...stg, status: 'running' as StageStatus };
          return { ...stg, status: 'waiting' as StageStatus };
        })
      }));

      currentIdx++;
    }, 1200);
  };

  const handleCustomUpload = async (uploadPayload: {
    name: string;
    language: string;
    content?: string;
    fileObj?: File;
    folderFiles?: Array<{ path: string; content: string }>;
  }) => {
    playCyberBlip(950);

    if (uploadPayload.folderFiles && uploadPayload.folderFiles.length > 0) {
      try {
        const res = await fetch(`${API_BASE}/api/projects/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: uploadPayload.name,
            language: uploadPayload.language,
            files: uploadPayload.folderFiles
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.securityRun) {
            setSecurityRun(data.securityRun);
          } else {
            setSecurityRun((prev) => ({
              ...prev,
              projectName: data.projectProfile?.name || uploadPayload.name,
              projectProfile: data.projectProfile || {
                ...prev.projectProfile,
                name: uploadPayload.name,
                fileCount: uploadPayload.folderFiles?.length || 1
              },
              findings: data.findings || prev.findings
            }));
          }
          playSuccessChime();
          // Stay on Project Intelligence page so user sees active uploaded project & full code studio
          setCurrentView('project-intelligence');
          return;
        }
      } catch (e) {
        console.warn('Folder upload API fallback:', e);
      }
    } else if (uploadPayload.fileObj) {
      try {
        const reader = new FileReader();
        const file = uploadPayload.fileObj;
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch(`${API_BASE}/api/projects/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: uploadPayload.name,
            filename: file.name,
            language: uploadPayload.language,
            fileData: base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.securityRun) {
            setSecurityRun(data.securityRun);
          } else {
            setSecurityRun((prev) => ({
              ...prev,
              projectName: data.projectProfile?.name || uploadPayload.name,
              projectProfile: data.projectProfile || {
                ...prev.projectProfile,
                name: uploadPayload.name,
                fileCount: data.filesCount || 1
              },
              findings: data.findings || prev.findings
            }));
          }
          playSuccessChime();
          // Stay on Project Intelligence page so user sees active uploaded project & full code studio
          setCurrentView('project-intelligence');
          return;
        }
      } catch (e) {
        console.warn('Backend upload failed, using local update:', e);
      }
    }

    setSecurityRun((prev) => ({
      ...prev,
      projectName: uploadPayload.name,
      projectProfile: {
        ...prev.projectProfile,
        name: uploadPayload.name,
        language: uploadPayload.language
      }
    }));
    playSuccessChime();
  };

  const handleSelectDemoProject = (projectName: string) => {
    playCyberBlip(900);
    setSecurityRun((prev) => ({
      ...prev,
      projectName: projectName,
      projectProfile: {
        ...prev.projectProfile,
        name: projectName
      }
    }));
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F3F6EE] text-[#1E2621] font-sans antialiased selection:bg-[#43881E] selection:text-white">
      {/* Full-Width Top Header: Brand Name in Top-Left */}
      <Header
        safetyMode={safetyMode}
        onSelectSafetyMode={setSafetyMode}
        onTriggerDemo={handleTriggerDemo}
        isRunningDemo={isSimulatingLiveRun}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        isMobileSidebarOpen={mobileSidebarOpen}
      />

      {/* Main App Body Below Header */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeRunCount={1}
          confirmedVulnCount={securityRun.findings.length}
          llmProvider="Sentinel Cyber-Reasoning Engine"
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* View Router Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-7 custom-scrollbar bg-[#F3F6EE] min-w-0 w-full">
          <div className="w-full max-w-[1720px] mx-auto space-y-4 sm:space-y-6 min-w-0">
            {currentView === 'command-center' && (
              <CommandCenterView
                run={securityRun}
                safetyMode={safetyMode}
                onNavigate={setCurrentView}
                onTriggerDemo={handleTriggerDemo}
                isRunningDemo={isSimulatingLiveRun}
              />
            )}

            {currentView === 'live-operation' && (
              <LiveOperationView
                run={securityRun}
                isRunningDemo={isSimulatingLiveRun}
                onTriggerDemo={handleTriggerDemo}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'project-intelligence' && (
              <ProjectIntelligenceView
                profile={securityRun.projectProfile}
                onSelectDemoProject={handleSelectDemoProject}
                onCustomUpload={handleCustomUpload}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'vulnerabilities' && (
              <VulnerabilityCenterView
                findings={securityRun.findings}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'pov' && (
              <ProofOfVulnerabilityView
                pov={securityRun.pov}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'patch-center' && (
              <PatchCenterView
                patchAttempts={securityRun.patchAttempts}
                activePatchIndex={activePatchIndex}
                onSelectPatchAttempt={setActivePatchIndex}
                safetyMode={safetyMode}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'verification' && (
              <IndependentVerificationView
                verification={securityRun.verificationResult}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'break-my-patch' && (
              <BreakMyPatchView
                data={securityRun.breakMyPatch}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'regression-performance' && (
              <RegressionPerformanceView
                regression={securityRun.regression}
                performance={securityRun.performance}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'time-machine' && (
              <TimeMachineView
                timeline={securityRun.timeline}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'agent-control' && (
              <AgentControlCenterView
                agents={securityRun.agents}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'certificates' && (
              <ProofCertificatesView
                certificate={securityRun.certificate}
                onNavigate={setCurrentView}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive System Purpose Guide & AI Diagnostic Modal */}
      <SystemGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToView={setCurrentView}
        onTriggerDemo={handleTriggerDemo}
        isRunningDemo={isSimulatingLiveRun}
      />
    </div>
  );
}
