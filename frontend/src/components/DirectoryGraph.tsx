import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FolderTree,
  FileCode,
  Folder,
  FolderOpen,
  Network,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  ExternalLink,
  FileText,
  Eye,
  CheckCircle2,
  Flame,
  Info,
  Radio,
  Move,
  Play,
  Pause,
  Focus,
  Target,
  Plus,
  Minus
} from 'lucide-react';
import { DIRECTORY_GRAPH_DEMO, GraphNode, GraphEdge, ProjectDirectoryGraphData } from '../data/directoryData';
import { SyntaxCodeBlock } from './SyntaxCodeBlock';
import { playCyberBlip, playSuccessChime, playAlertSound } from '../utils/audio';

interface DirectoryGraphProps {
  customGraphData?: ProjectDirectoryGraphData;
  onSelectNode?: (node: GraphNode) => void;
  onNavigateToView?: (viewId: any) => void;
  embedded?: boolean;
}

export const DirectoryGraph: React.FC<DirectoryGraphProps> = ({
  customGraphData,
  onSelectNode,
  onNavigateToView,
  embedded = false
}) => {
  const [activeGraphMode, setActiveGraphMode] = useState<'tree_hierarchy' | 'taint_path' | 'call_graph' | 'tree_list'>('tree_hierarchy');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('file-parser');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'vulnerable' | 'source' | 'tests'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default zoom and pan for high-resolution wide tree canvas
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 15 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [flowAnimation, setFlowAnimation] = useState<boolean>(true);

  // Folder expansion map: maps folder ID to boolean
  const [expandedFolderMap, setExpandedFolderMap] = useState<Record<string, boolean>>({
    'dir-src': true,
    'dir-include': true,
    'dir-tests': true,
    'dir-config': true,
    'dir-root-files': true
  });

  const baseGraphData = customGraphData || DIRECTORY_GRAPH_DEMO;
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean Directory Architecture Normalizer: Organizes any codebase into Root -> Clean Folders -> Files
  const normalizedStructure = useMemo(() => {
    const rawNodes = baseGraphData.nodes || [];
    
    // 1. Root Node
    let root = rawNodes.find((n) => n.id === 'dir-root' || n.path === '/' || (n.type === 'directory' && !n.parentId));
    if (!root) {
      root = {
        id: 'dir-root',
        label: baseGraphData.projectName || 'packet-parser-demo',
        path: '/',
        type: 'directory',
        category: 'core',
        status: 'safe',
        description: `Project root repository container for ${baseGraphData.projectName || 'target'}`,
        x: 800,
        y: 35
      };
    }

    const folders: GraphNode[] = [];
    const filesByFolder: Record<string, GraphNode[]> = {};
    const folderIdSet = new Set<string>();

    // 2. Identify Explicit Directories (excluding root)
    rawNodes.forEach((n) => {
      if (n.type === 'directory' && n.id !== root.id) {
        folders.push(n);
        folderIdSet.add(n.id);
        filesByFolder[n.id] = [];
      }
    });

    // 3. Map Every File to its Exact Folder
    const looseRootFiles: GraphNode[] = [];

    rawNodes.forEach((n) => {
      if (n.id === root.id || n.type === 'directory') return;

      let parentFolderId = n.parentId;

      // If no valid parentId, extract top-level directory from path
      if (!parentFolderId || !folderIdSet.has(parentFolderId)) {
        const cleanPath = (n.path || n.label || '').replace(/^[/\\]+/, '');
        const segments = cleanPath.split(/[/\\]/);

        if (segments.length > 1) {
          const folderName = segments[0];
          parentFolderId = `dir-${folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

          if (!folderIdSet.has(parentFolderId)) {
            const newFolderNode: GraphNode = {
              id: parentFolderId,
              label: `${folderName}/`,
              path: `/${folderName}`,
              type: 'directory',
              category: 'core',
              status: n.status === 'vulnerable' ? 'tainted' : 'safe',
              description: `Module folder: ${folderName}/`,
              x: 0,
              y: 0,
              parentId: root.id
            };
            folders.push(newFolderNode);
            folderIdSet.add(parentFolderId);
            filesByFolder[parentFolderId] = [];
          }
        } else {
          // File directly in project root (e.g. index.html, .gitignore, CMakeLists.txt)
          looseRootFiles.push(n);
          return;
        }
      }

      if (!filesByFolder[parentFolderId]) {
        filesByFolder[parentFolderId] = [];
      }
      filesByFolder[parentFolderId].push({ ...n, parentId: parentFolderId });
    });

    // 4. If there are loose root files, put them neatly in a "root /" or "config /" folder
    if (looseRootFiles.length > 0) {
      const rootFolderId = 'dir-root-files';
      if (!folderIdSet.has(rootFolderId)) {
        const rootFilesFolder: GraphNode = {
          id: rootFolderId,
          label: 'root /',
          path: '/',
          type: 'directory',
          category: 'build',
          status: 'safe',
          description: 'Root configuration manifests, package files, and entry assets.',
          x: 0,
          y: 0,
          parentId: root.id
        };
        folders.unshift(rootFilesFolder); // Place first on left
        folderIdSet.add(rootFolderId);
        filesByFolder[rootFolderId] = looseRootFiles.map((f) => ({ ...f, parentId: rootFolderId }));
      } else {
        filesByFolder[rootFolderId] = looseRootFiles.map((f) => ({ ...f, parentId: rootFolderId }));
      }
    }

    // Default fallback if project had only loose files
    if (folders.length === 0 && rawNodes.length > 1) {
      const srcFolder: GraphNode = {
        id: 'dir-src',
        label: 'src/',
        path: '/src',
        type: 'directory',
        category: 'core',
        status: 'safe',
        description: 'Source modules',
        x: 0,
        y: 0,
        parentId: root.id
      };
      folders.push(srcFolder);
      filesByFolder['dir-src'] = rawNodes.filter((n) => n.id !== root.id);
    }

    return { root, folders, filesByFolder };
  }, [baseGraphData]);

  const handleExpandAll = () => {
    playCyberBlip(900);
    const next: Record<string, boolean> = { 'dir-root': true };
    normalizedStructure.folders.forEach((f) => {
      next[f.id] = true;
    });
    setExpandedFolderMap(next);
  };

  const handleCollapseAll = () => {
    playCyberBlip(700);
    const next: Record<string, boolean> = { 'dir-root': true };
    normalizedStructure.folders.forEach((f) => {
      next[f.id] = false;
    });
    setExpandedFolderMap(next);
  };

  const toggleFolder = (folderId: string) => {
    playCyberBlip(850);
    setExpandedFolderMap((prev) => ({
      ...prev,
      [folderId]: prev[folderId] === false ? true : false
    }));
  };

  // Zero-Collision Tree Spine Layout Engine
  const layout = useMemo(() => {
    const { root, folders, filesByFolder } = normalizedStructure;
    const nodeCoords: Record<string, { x: number; y: number; visible: boolean; node: GraphNode }> = {};
    const visibleEdges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
      isTaintPath?: boolean;
      label?: string;
      customPath?: string;
    }> = [];
    const folderSpines: Array<{
      folderId: string;
      spineX: number;
      startY: number;
      endY: number;
      branchPoints: Array<{ x: number; y: number }>;
    }> = [];

    const totalFolders = Math.max(1, folders.length);
    const folderColWidth = 270;
    const canvasWidth = Math.max(1600, totalFolders * folderColWidth + 200);
    const centerX = canvasWidth / 2;

    // Root project node (Top Center)
    const rootX = centerX - 100;
    const rootY = 30;
    nodeCoords[root.id] = { x: rootX, y: rootY, visible: true, node: root };

    // Layout Folders across Level 1
    const totalSpan = (totalFolders - 1) * folderColWidth;
    const startFolderX = Math.max(50, centerX - totalSpan / 2 - 80);

    folders.forEach((folder, fIdx) => {
      const folderX = startFolderX + fIdx * folderColWidth;
      const folderY = 140;
      nodeCoords[folder.id] = { x: folderX, y: folderY, visible: true, node: folder };

      // Root -> Folder Curved Spline
      const rBottomX = rootX + 100;
      const rBottomY = rootY + 54;
      const fTopX = folderX + 85;
      const fTopY = folderY;

      const dy = fTopY - rBottomY;
      const rootToFolderCurve = `M ${rBottomX} ${rBottomY} C ${rBottomX} ${rBottomY + dy * 0.55}, ${fTopX} ${fTopY - dy * 0.45}, ${fTopX} ${fTopY}`;

      visibleEdges.push({
        id: `edge-root-${folder.id}`,
        source: root.id,
        target: folder.id,
        type: 'hierarchy',
        customPath: rootToFolderCurve
      });

      // Folder's Children Files in a Clean Non-Colliding Vertical Spine Cascade
      const isExpanded = expandedFolderMap[folder.id] !== false;
      const children = filesByFolder[folder.id] || [];

      if (children.length > 0) {
        const spineX = folderX + 15;
        const spineStartY = folderY + 54;
        let lastFileCenterY = spineStartY;
        const branchPoints: Array<{ x: number; y: number }> = [];

        children.forEach((file, cIdx) => {
          const fileX = folderX + 32;
          const fileY = folderY + 85 + cIdx * 78;
          const fileCenterY = fileY + 28;
          lastFileCenterY = fileCenterY;

          nodeCoords[file.id] = {
            x: fileX,
            y: fileY,
            visible: isExpanded,
            node: file
          };

          if (isExpanded) {
            branchPoints.push({ x: fileX, y: fileCenterY });

            // Horizontal branch from spine to file card
            visibleEdges.push({
              id: `edge-branch-${folder.id}-${file.id}`,
              source: folder.id,
              target: file.id,
              type: 'hierarchy',
              customPath: `M ${spineX} ${fileCenterY} L ${fileX} ${fileCenterY}`
            });
          }
        });

        if (isExpanded) {
          folderSpines.push({
            folderId: folder.id,
            spineX,
            startY: spineStartY,
            endY: lastFileCenterY,
            branchPoints
          });
        }
      }
    });

    // Cross-file Taint & Call Linkages (Curved around cards)
    if (baseGraphData.edges) {
      baseGraphData.edges.forEach((edge) => {
        if (edge.type !== 'hierarchy') {
          const sCoord = nodeCoords[edge.source];
          const tCoord = nodeCoords[edge.target];
          if (sCoord && tCoord && sCoord.visible && tCoord.visible) {
            const sx = sCoord.x + 160;
            const sy = sCoord.y + 28;
            const tx = tCoord.x;
            const ty = tCoord.y + 28;

            const dx = Math.abs(tx - sx);
            const dy = ty - sy;
            const taintCurve = `M ${sx} ${sy} C ${sx + Math.max(50, dx * 0.45)} ${sy}, ${tx - Math.max(50, dx * 0.45)} ${ty}, ${tx} ${ty}`;

            visibleEdges.push({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.type,
              isTaintPath: edge.isTaintPath,
              label: edge.label,
              customPath: taintCurve
            });
          }
        }
      });
    }

    return { nodeCoords, visibleEdges, folderSpines, canvasWidth };
  }, [normalizedStructure, expandedFolderMap, baseGraphData.edges]);

  // Visible filtered node list
  const visibleNodes = useMemo(() => {
    return Object.values(layout.nodeCoords)
      .filter(({ visible, node }) => {
        if (!visible) return false;
        const matchesSearch =
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.description && node.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;
        if (filterCategory === 'vulnerable') return node.status === 'vulnerable' || node.status === 'tainted';
        if (filterCategory === 'source') return node.type === 'source' || node.type === 'header';
        if (filterCategory === 'tests') return node.type === 'test' || node.type === 'payload';
        return true;
      })
      .map(({ node }) => node);
  }, [layout, searchQuery, filterCategory]);

  const allSourceFiles = useMemo(() => {
    return (baseGraphData.nodes || []).filter((n) => n.type !== 'directory');
  }, [baseGraphData.nodes]);

  const selectedNode = useMemo(() => {
    const rawNodes = baseGraphData.nodes || [];
    const direct = rawNodes.find((n) => n.id === selectedNodeId);
    
    // If direct node selected has code preview, use it
    if (direct && direct.type !== 'directory' && direct.codePreview) {
      return direct;
    }
    // If a folder is clicked, preview its first contained source file
    if (direct && direct.type === 'directory') {
      const filesInFolder = normalizedStructure.filesByFolder[direct.id] || [];
      if (filesInFolder.length > 0 && filesInFolder[0].codePreview) {
        return filesInFolder[0];
      }
    }
    // Default to the primary vulnerable file or first source file
    return (
      rawNodes.find((n) => n.status === 'vulnerable' && n.codePreview) ||
      rawNodes.find((n) => (n.type === 'source' || n.type === 'header') && n.codePreview) ||
      allSourceFiles[0] ||
      direct ||
      normalizedStructure.root
    );
  }, [selectedNodeId, baseGraphData.nodes, normalizedStructure, allSourceFiles]);

  // Connected edges for hover & selection highlight
  const activeConnectedEdgeIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return new Set<string>();
    const ids = new Set<string>();
    layout.visibleEdges.forEach((edge) => {
      if (edge.source === targetId || edge.target === targetId) {
        ids.add(edge.id);
      }
    });
    return ids;
  }, [hoveredNodeId, selectedNodeId, layout.visibleEdges]);

  const handleNodeClick = (node: GraphNode) => {
    playCyberBlip(1000);
    setSelectedNodeId(node.id);
    if (node.type === 'directory' && node.id !== normalizedStructure.root.id) {
      toggleFolder(node.id);
    }
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  const handleFocusVulnerability = () => {
    playAlertSound();
    handleExpandAll();
    const vulnNode = baseGraphData.nodes.find((n) => n.status === 'vulnerable') || baseGraphData.nodes[0];
    if (vulnNode) {
      setSelectedNodeId(vulnNode.id);
      setZoomLevel(0.95);
      setPanOffset({ x: -180, y: -120 });
    }
  };

  const handleResetView = () => {
    playCyberBlip(900);
    setZoomLevel(0.85);
    setPanOffset({ x: 40, y: 15 });
    handleExpandAll();
  };

  // Canvas Panning (Mouse & Touch)
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
  };

  const handleTouchStartCanvas = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
    }
  };

  const handleTouchMoveCanvas = (e: React.TouchEvent) => {
    // Prevent page scroll when interacting with the graph canvas
    if (e.touches.length === 1 && isPanning) {
      setPanOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y
      });
    } else if (e.touches.length === 2 && initialPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDist;
      if (Math.abs(factor - 1) > 0.05) {
        setZoomLevel((prev) => Math.min(1.6, Math.max(0.4, prev * (factor > 1 ? 1.05 : 0.95))));
        setInitialPinchDist(dist);
      }
    }
  };

  const handleTouchEndCanvas = () => {
    setIsPanning(false);
    setInitialPinchDist(null);
  };

  // Node Color styling
  const getNodeColor = (node: GraphNode) => {
    switch (node.status) {
      case 'vulnerable':
        return {
          bg: 'bg-[#FFFFFF] hover:bg-[#FDF2F4]',
          border: 'border-[#F7CDD4]',
          borderSelected: 'border-[#D9485D] ring-2 ring-[#D9485D]/40',
          text: 'text-[#B22D42]',
          badge: 'bg-[#FDF2F4] text-[#B22D42] border border-[#F7CDD4]',
          dot: 'bg-[#D9485D]',
          glow: 'shadow-[0_4px_16px_rgba(217,72,93,0.12)]'
        };
      case 'tainted':
        return {
          bg: 'bg-[#FFFFFF] hover:bg-[#FEF9F0]',
          border: 'border-[#F8E6C8]',
          borderSelected: 'border-[#C27918] ring-2 ring-[#C27918]/40',
          text: 'text-[#965B0C]',
          badge: 'bg-[#FEF9F0] text-[#965B0C] border border-[#F8E6C8]',
          dot: 'bg-[#C27918]',
          glow: 'shadow-[0_4px_16px_rgba(194,121,24,0.12)]'
        };
      case 'patched':
        return {
          bg: 'bg-[#FFFFFF] hover:bg-[#F1F8EC]',
          border: 'border-[#D1E7C4]',
          borderSelected: 'border-[#43881E] ring-2 ring-[#43881E]/40',
          text: 'text-[#377218]',
          badge: 'bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4]',
          dot: 'bg-[#43881E]',
          glow: 'shadow-[0_4px_16px_rgba(67,136,30,0.12)]'
        };
      case 'verified':
        return {
          bg: 'bg-[#FFFFFF] hover:bg-[#F0F8F3]',
          border: 'border-[#C8E6D3]',
          borderSelected: 'border-[#1E824C] ring-2 ring-[#1E824C]/40',
          text: 'text-[#17653B]',
          badge: 'bg-[#F0F8F3] text-[#17653B] border border-[#C8E6D3]',
          dot: 'bg-[#1E824C]',
          glow: 'shadow-[0_4px_16px_rgba(30,130,76,0.12)]'
        };
      default:
        return {
          bg: 'bg-[#FFFFFF] hover:bg-[#FAFBF7]',
          border: 'border-[#DFE4D8]',
          borderSelected: 'border-[#43881E] ring-2 ring-[#43881E]/30',
          text: 'text-[#1E2621]',
          badge: 'bg-[#FAFBF7] text-[#586459] border border-[#DFE4D8]',
          dot: 'bg-[#818D82]',
          glow: 'shadow-[0_2px_8px_rgba(30,40,25,0.04)]'
        };
    }
  };

  return (
    <div id="directory-graph-container" className="space-y-4 font-sans">
      {/* Top Toolbar */}
      <div className="bg-[#FFFFFF] p-5 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DFE4D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1F8EC] border border-[#D1E7C4] flex items-center justify-center text-[#43881E] shadow-sm">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1E2621]">
                  Project Architecture & Directory Hierarchy Graph
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F8EC] text-[#377218] border border-[#D1E7C4]">
                  Zero-Collision Trunk Tree • {visibleNodes.length} Nodes Active
                </span>
              </div>
              <p className="text-xs text-[#586459] mt-0.5">
                Topological folder spines, orthogonal non-overlapping branches, AST symbol inspection, and animated attack propagation traces.
              </p>
            </div>
          </div>

          {/* Graph Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAFBF7] border border-[#DFE4D8] rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                playCyberBlip(750);
                setActiveGraphMode('tree_hierarchy');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeGraphMode === 'tree_hierarchy'
                  ? 'bg-[#43881E] text-white shadow-sm font-bold'
                  : 'text-[#586459] hover:text-[#1E2621] hover:bg-[#F3F6EE]'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Tree Hierarchy</span>
            </button>

            <button
              onClick={() => {
                playCyberBlip(750);
                setActiveGraphMode('taint_path');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeGraphMode === 'taint_path'
                  ? 'bg-[#D9485D] text-white shadow-sm font-bold'
                  : 'text-[#586459] hover:text-[#1E2621] hover:bg-[#F3F6EE]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Taint Attack Trace</span>
            </button>

            <button
              onClick={() => {
                playCyberBlip(750);
                setActiveGraphMode('call_graph');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeGraphMode === 'call_graph'
                  ? 'bg-[#2E7F8C] text-white shadow-sm font-bold'
                  : 'text-[#586459] hover:text-[#1E2621] hover:bg-[#F3F6EE]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Call & Data Flow</span>
            </button>

            <button
              onClick={() => {
                playCyberBlip(750);
                setActiveGraphMode('tree_list');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeGraphMode === 'tree_list'
                  ? 'bg-[#1E824C] text-white shadow-sm font-bold'
                  : 'text-[#586459] hover:text-[#1E2621] hover:bg-[#F3F6EE]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>File Explorer</span>
            </button>
          </div>
        </div>

        {/* Secondary Filters & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#818D82]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file, symbol, or folder..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8] text-xs text-[#1E2621] placeholder-[#818D82] focus:outline-none focus:border-[#43881E] transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterCategory === 'all'
                    ? 'bg-[#1E2621] text-white'
                    : 'bg-[#FAFBF7] text-[#586459] border border-[#DFE4D8] hover:bg-[#F3F6EE]'
                }`}
              >
                All ({baseGraphData.nodes.length})
              </button>
              <button
                onClick={() => setFilterCategory('vulnerable')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterCategory === 'vulnerable'
                    ? 'bg-[#D9485D] text-white'
                    : 'bg-[#FDF2F4] text-[#B22D42] border border-[#F7CDD4] hover:bg-[#FBEDEF]'
                }`}
              >
                Hazards
              </button>
              <button
                onClick={() => setFilterCategory('source')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterCategory === 'source'
                    ? 'bg-[#2E7F8C] text-white'
                    : 'bg-[#F0F8F9] text-[#20626D] border border-[#C7E5E9] hover:bg-[#E5F4F6]'
                }`}
              >
                Source
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Expand / Collapse All */}
            <div className="flex items-center bg-[#FAFBF7] border border-[#DFE4D8] rounded-lg p-0.5 text-xs font-semibold text-[#586459]">
              <button
                onClick={handleExpandAll}
                className="px-2.5 py-1 rounded hover:bg-[#FFFFFF] hover:text-[#1E2621] flex items-center gap-1"
                title="Expand all folders"
              >
                <Plus className="w-3 h-3" />
                <span>Expand All</span>
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2.5 py-1 rounded hover:bg-[#FFFFFF] hover:text-[#1E2621] flex items-center gap-1"
                title="Collapse all folders"
              >
                <Minus className="w-3 h-3" />
                <span>Collapse</span>
              </button>
            </div>

            <button
              onClick={handleFocusVulnerability}
              className="px-3 py-1.5 rounded-lg bg-[#FDF2F4] hover:bg-[#FBEDEF] border border-[#F7CDD4] text-[#B22D42] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Target Vulnerable Sink"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target Vulnerability</span>
            </button>

            {/* Panoramic Fullscreen Mode */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                isFullscreen
                  ? 'bg-[#1E2621] text-white border-[#1E2621]'
                  : 'bg-[#FAFBF7] text-[#586459] border-[#DFE4D8] hover:bg-[#FFFFFF]'
              }`}
              title={isFullscreen ? 'Exit Panoramic Mode' : 'Expand Full Panoramic Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Panoramic'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-[#FAFBF7] border border-[#DFE4D8] rounded-lg p-0.5">
              <button
                onClick={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.1))}
                className="p-1 text-[#586459] hover:text-[#1E2621] rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-2 text-[#586459]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.1))}
                className="p-1 text-[#586459] hover:text-[#1E2621] rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1 text-[#586459] hover:text-[#1E2621] rounded ml-0.5"
                title="Reset View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Layout */}
      <div className="space-y-6">
        {/* Visual Graph Canvas (Full-Width 12 Cols) */}
        <div className="w-full bg-[#FFFFFF] p-5 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)] overflow-hidden flex flex-col min-h-[580px] relative transition-all duration-300">
          {activeGraphMode !== 'tree_list' ? (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDownCanvas}
              onMouseMove={handleMouseMoveCanvas}
              onMouseUp={handleMouseUpCanvas}
              onMouseLeave={handleMouseUpCanvas}
              onTouchStart={handleTouchStartCanvas}
              onTouchMove={handleTouchMoveCanvas}
              onTouchEnd={handleTouchEndCanvas}
              className={`relative flex-1 w-full h-full min-h-[440px] sm:min-h-[540px] bg-[#FAFBF7] rounded-2xl border border-[#DFE4D8] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing ${
                isPanning ? 'cursor-grabbing' : ''
              }`}
            >
              {/* Dot Grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(#CBD2C4 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  transform: `translate(${panOffset.x % 24}px, ${panOffset.y % 24}px)`
                }}
              />

              {/* Floating Mobile/Tablet Navigation Capsule */}
              <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DFE4D8] rounded-xl p-1.5 shadow-md">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                  className="p-2 rounded-lg bg-[#FAFBF7] hover:bg-[#F1F8EC] text-[#1E2621] border border-[#DFE4D8] shadow-2xs text-xs font-bold active:scale-95 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-[#43881E]" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
                  className="p-2 rounded-lg bg-[#FAFBF7] hover:bg-[#F1F8EC] text-[#1E2621] border border-[#DFE4D8] shadow-2xs text-xs font-bold active:scale-95 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-[#586459]" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-2 rounded-lg bg-[#FAFBF7] hover:bg-[#F1F8EC] text-[#1E2621] border border-[#DFE4D8] shadow-2xs text-xs font-bold active:scale-95 transition-all"
                  title="Reset Canvas Position"
                >
                  <RefreshCw className="w-4 h-4 text-[#2E7F8C]" />
                </button>
                <button
                  onClick={handleFocusVulnerability}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FDF2F4] hover:bg-[#FBEDEF] border border-[#F7CDD4] text-[#B22D42] text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                  title="Target Vulnerable Sink"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Target Flaw</span>
                </button>
              </div>

              {/* Scalable Container with Dynamic Zero-Collision Dimensions */}
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: '0 0'
                }}
                className="absolute w-[1800px] h-[950px] transition-transform duration-75"
              >
                {/* SVG Connections Canvas */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1800 950"
                  shapeRendering="geometricPrecision"
                  textRendering="geometricPrecision"
                >
                  <defs>
                    <linearGradient id="taintFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C27918" />
                      <stop offset="50%" stopColor="#D9485D" />
                      <stop offset="100%" stopColor="#B22D42" />
                    </linearGradient>

                    <filter id="glow-taint-intense" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* 1. Draw Vertical Trunk Spines for each open Folder */}
                  {layout.folderSpines.map((spine) => (
                    <g key={`spine-${spine.folderId}`}>
                      {/* Vertical spine line */}
                      <path
                        d={`M ${spine.spineX} ${spine.startY} L ${spine.spineX} ${spine.endY}`}
                        fill="none"
                        stroke="#6B8E5F"
                        strokeWidth="2.2"
                        strokeDasharray="4,3"
                        strokeOpacity="0.85"
                      />
                      {/* Anchor dot on spine top */}
                      <circle cx={spine.spineX} cy={spine.startY} r="3" fill="#43881E" />
                    </g>
                  ))}

                  {/* 2. Draw Branch & Curved Conduits */}
                  {layout.visibleEdges.map((edge) => {
                    const isTaintEdge = edge.isTaintPath;
                    const isBranch = edge.id.startsWith('edge-branch-');
                    const isRootBranch = edge.id.startsWith('edge-root-');
                    const isHighlighted = activeConnectedEdgeIds.has(edge.id);

                    const pathD = edge.customPath || '';
                    if (!pathD) return null;

                    const strokeColor = isTaintEdge
                      ? 'url(#taintFlowGradient)'
                      : isRootBranch
                      ? '#43881E'
                      : isBranch
                      ? '#6B8E5F'
                      : '#818D82';

                    return (
                      <g key={edge.id}>
                        {isTaintEdge && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#D9485D"
                            strokeWidth="8"
                            strokeOpacity="0.3"
                            filter="url(#glow-taint-intense)"
                          />
                        )}

                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isTaintEdge ? '3.5' : isHighlighted ? '2.5' : isRootBranch ? '2' : '1.5'}
                          strokeDasharray={isBranch ? 'none' : isTaintEdge ? '7,4' : '5,4'}
                          strokeOpacity={isTaintEdge ? '1' : isHighlighted ? '0.95' : '0.75'}
                        />

                        {isTaintEdge && (
                          <circle r="4" fill="#D9485D" className="shadow-lg">
                            <animateMotion dur="2.8s" repeatCount="indefinite" path={pathD} />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Render Graph Nodes */}
                {Object.values(normalizedStructure.folders).concat(
                  normalizedStructure.root,
                  ...Object.values(normalizedStructure.filesByFolder)
                ).map((node) => {
                  const isVisible = layout.nodeCoords[node.id]?.visible !== false;
                  if (!isVisible) return null;

                  const colorConfig = getNodeColor(node);
                  const isSelected = node.id === selectedNodeId;
                  const isHovered = node.id === hoveredNodeId;
                  const isVulnerable = node.status === 'vulnerable';
                  const isTainted = node.status === 'tainted';
                  const isPatched = node.status === 'patched';
                  const isDirectory = node.type === 'directory';
                  const isRoot = node.id === normalizedStructure.root.id;

                  const coord = layout.nodeCoords[node.id] || { x: node.x, y: node.y };
                  const childrenCount = (normalizedStructure.filesByFolder[node.id] || []).length;

                  return (
                    <div
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`absolute cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? 'z-30 scale-105'
                          : isHovered
                          ? 'z-20 scale-102'
                          : 'z-10'
                      }`}
                      style={{
                        left: `${coord.x}px`,
                        top: `${coord.y}px`,
                        width: isRoot ? '200px' : isDirectory ? '170px' : '155px'
                      }}
                    >
                      <div
                        className={`p-3 rounded-2xl border transition-all ${colorConfig.bg} ${
                          isSelected ? colorConfig.borderSelected : colorConfig.border
                        } ${colorConfig.glow} shadow-[0_4px_16px_rgba(30,40,25,0.06)]`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <div className="p-1 rounded-md bg-[#FAFBF7] border border-[#DFE4D8] shrink-0 shadow-2xs">
                              {isRoot ? (
                                <FolderTree className="w-4 h-4 text-[#43881E]" />
                              ) : isDirectory ? (
                                expandedFolderMap[node.id] !== false ? <FolderOpen className="w-3.5 h-3.5 text-[#43881E]" /> : <Folder className="w-3.5 h-3.5 text-[#2E7F8C]" />
                              ) : node.type === 'test' || node.type === 'payload' ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-[#C27918]" />
                              ) : (
                                <FileCode className="w-3.5 h-3.5 text-[#43881E]" />
                              )}
                            </div>
                            <span className={`text-xs font-bold truncate ${colorConfig.text}`}>
                              {node.label}
                            </span>
                          </div>

                          {(isVulnerable || isTainted) && (
                            <span className="relative flex h-3 w-3 shrink-0">
                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                  isVulnerable ? 'bg-[#D9485D]' : 'bg-[#C27918]'
                                }`}
                              />
                              <span
                                className={`relative inline-flex rounded-full h-3 w-3 ${
                                  isVulnerable ? 'bg-[#D9485D]' : 'bg-[#C27918]'
                                }`}
                              />
                            </span>
                          )}

                          {isPatched && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#43881E] shrink-0" />
                          )}
                        </div>

                        {/* Folder Expansion Toggle Badge / File LoC */}
                        <div className="flex items-center justify-between text-[10px] text-[#586459] pt-1.5 border-t border-[#DFE4D8]/80 font-medium">
                          {isDirectory && !isRoot ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[#43881E] font-semibold">
                                {expandedFolderMap[node.id] !== false ? '▼ Open' : '▶ Expand'}
                              </span>
                              <span className="bg-[#FAFBF7] px-1.5 py-0.5 rounded border border-[#DFE4D8] font-bold">
                                {childrenCount} files
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="font-mono">{node.type.toUpperCase()}</span>
                              {node.loc && <span>{node.loc} LoC</span>}
                              {node.status !== 'safe' && (
                                <span className={`font-bold uppercase ${colorConfig.text}`}>
                                  {node.status}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Viewport Overlay */}
              <div className="absolute bottom-4 left-4 bg-[#FFFFFF]/90 backdrop-blur-md border border-[#DFE4D8] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-[#586459] shadow-sm pointer-events-none">
                <Move className="w-3.5 h-3.5 text-[#43881E]" />
                <span>Tree Spine Layout • Click any node to open full source code below • Drag to pan</span>
              </div>
            </div>
          ) : (
            /* File Explorer View */
            <div className="flex-1 w-full bg-[#FAFBF7] rounded-xl border border-[#DFE4D8] p-5 text-xs overflow-y-auto font-sans">
              <div className="text-xs font-bold text-[#586459] uppercase pb-2 mb-3 border-b border-[#DFE4D8]">
                PROJECT REPOSITORY DIRECTORY STRUCTURE
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#1E2621]">
                  <FolderOpen className="w-4 h-4 text-[#43881E]" />
                  <span>{normalizedStructure.root.label}</span>
                </div>

                <div className="pl-4 space-y-2 border-l-2 border-[#DFE4D8]">
                  {normalizedStructure.folders.map((folder) => {
                    const isExpanded = expandedFolderMap[folder.id] !== false;
                    const children = normalizedStructure.filesByFolder[folder.id] || [];
                    return (
                      <div key={folder.id} className="space-y-1">
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="flex items-center gap-2 font-bold text-[#1E2621] hover:text-[#43881E] py-1"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#818D82]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#818D82]" />}
                          <Folder className="w-3.5 h-3.5 text-[#2E7F8C]" />
                          <span>{folder.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAFBF7] text-[#586459] border border-[#DFE4D8]">
                            {children.length} files
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="pl-6 space-y-1 border-l border-[#DFE4D8]">
                            {children.map((file) => (
                              <button
                                key={file.id}
                                onClick={() => handleNodeClick(file)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                  file.id === selectedNodeId
                                    ? 'bg-[#F1F8EC] text-[#1E2621] font-bold border border-[#D1E7C4]'
                                    : 'text-[#586459] hover:bg-[#FFFFFF]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <FileCode className="w-3.5 h-3.5 text-[#43881E]" />
                                  <span>{file.label}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getNodeColor(file).badge}`}>
                                  {file.status} • {file.loc} LoC
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3 border-t border-[#DFE4D8] text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#586459] font-semibold">Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43881E]" />
                <span className="text-[#43881E] font-semibold">Root / Folder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9485D]" />
                <span className="text-[#B22D42] font-semibold">Vulnerability Site</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C27918]" />
                <span className="text-[#965B0C] font-semibold">Tainted Ingress</span>
              </div>
            </div>

            <div className="text-[#818D82] text-[11px] font-medium">
              Orthogonal spine branches • Click any folder card to toggle its files
            </div>
          </div>
        </div>

        {/* Dedicated Full-Width Code Studio & AST Inspector Panel */}
        <div className="w-full bg-[#FFFFFF] p-6 border border-[#DFE4D8] rounded-[14px] shadow-[0_2px_10px_rgba(30,40,25,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DFE4D8] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F8F3] border border-[#C8E6D3] flex items-center justify-center text-[#43881E]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1E2621] flex items-center gap-2">
                  <span>Source Code & AST Node Studio</span>
                  <span className="text-xs text-[#586459] font-mono">({selectedNode.path || selectedNode.label})</span>
                </h4>
                <p className="text-xs text-[#586459]">
                  Live AST symbol resolution, LoC inspection, and vulnerability sink analysis.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick File Switcher */}
              {allSourceFiles.length > 1 && (
                <div className="flex items-center gap-1.5 bg-[#FAFBF7] border border-[#DFE4D8] rounded-lg px-2.5 py-1">
                  <span className="text-[11px] text-[#586459] font-medium">Select File:</span>
                  <select
                    value={selectedNode.id}
                    onChange={(e) => {
                      const chosen = allSourceFiles.find((f) => f.id === e.target.value);
                      if (chosen) handleNodeClick(chosen);
                    }}
                    className="bg-transparent text-xs font-bold font-mono text-[#1E2621] focus:outline-none cursor-pointer"
                  >
                    {allSourceFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.label} ({file.loc || 30} LoC) {file.status === 'vulnerable' ? '⚠️' : '✓'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${getNodeColor(selectedNode).badge}`}>
                {selectedNode.status}
              </span>
              {selectedNode.status === 'vulnerable' && onNavigateToView && (
                <button
                  onClick={() => {
                    playSuccessChime();
                    onNavigateToView('vulnerabilities');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D9485D] hover:bg-[#B22D42] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Inspect Flaw in Vulnerability Center</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Col: Metadata & Symbols (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-xl bg-[#FAFBF7] border border-[#DFE4D8] space-y-2">
                <div className="text-[11px] text-[#818D82] uppercase font-bold">Node Identity:</div>
                <div className="text-sm font-bold text-[#1E2621] font-mono">{selectedNode.label}</div>
                <p className="text-xs text-[#4E594F] leading-relaxed font-medium">{selectedNode.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                  <span className="text-[10px] text-[#818D82] block font-bold">LINES OF CODE</span>
                  <span className="text-base font-bold text-[#1E2621]">{selectedNode.loc || '35'} LoC</span>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8]">
                  <span className="text-[10px] text-[#818D82] block font-bold">RISK EVALUATION</span>
                  <span className={`text-base font-bold ${selectedNode.status === 'vulnerable' ? 'text-[#B22D42]' : 'text-[#377218]'}`}>
                    {selectedNode.status === 'vulnerable' ? '8.8 / 10' : '0.0 / 10'}
                  </span>
                </div>
              </div>

              {selectedNode.functions && selectedNode.functions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-[#818D82] uppercase font-bold">RESOLVED AST SYMBOLS & SIZES:</div>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                    {selectedNode.functions.map((fn, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#FAFBF7] border border-[#DFE4D8] text-[#1E2621] flex items-center justify-between font-mono font-medium"
                      >
                        <span>{fn}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#43881E]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Full Spacious Code Block (8 cols) */}
            <div className="lg:col-span-8 space-y-1.5">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-[#586459] font-mono font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#43881E]" />
                  <span>{selectedNode.path || selectedNode.label}</span>
                </span>
                <span className="text-xs text-[#818D82]">
                  {selectedNode.type.toUpperCase()} • UTF-8 Source Buffer
                </span>
              </div>

              <SyntaxCodeBlock
                code={selectedNode.codePreview || `// ${selectedNode.label}\n// No inline preview buffer available for directory containers.`}
                language="cpp"
                title={`${selectedNode.label} (Source Code View)`}
                highlightType={selectedNode.status === 'vulnerable' ? 'vuln' : selectedNode.status === 'patched' ? 'patch' : 'neutral'}
                showLineNumbers={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
