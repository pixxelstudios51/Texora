"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Upload, 
  Paintbrush, 
  Layers, 
  Grid, 
  Palette, 
  Maximize2, 
  FileJson, 
  Check, 
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  RotateCw,
  Copy,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Settings,
  HelpCircle,
  FileImage,
  RefreshCw,
  Scissors,
  Compass,
  ShieldCheck
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  productType: string;
  status: string;
  originalImageUrl: string | null;
  thumbnailUrl: string | null;
}

interface DBVersion {
  id: string;
  versionNumber: number;
  canvasState: string;
  previewUrl: string | null;
}

interface DBLayer {
  id: string;
  name: string;
  type: string;
  order: number;
  imageUrl: string | null;
  visible: boolean;
  locked: boolean;
  opacity: number;
  metadata: string | null;
}

interface DBScreen {
  id: string;
  colorName: string;
  hex: string;
  order: number;
}

interface WorkspaceClientProps {
  user: any;
  project: Project & { versions: DBVersion[]; layers: DBLayer[]; screenSeparations: DBScreen[] };
  initialLayers: DBLayer[];
  initialScreens: DBScreen[];
  libraryMotifs: any[];
}

interface CanvasItem {
  id: string;
  type: 'motif' | 'border' | 'background';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export default function WorkspaceClient({
  user,
  project,
  initialLayers,
  initialScreens,
  libraryMotifs
}: WorkspaceClientProps) {
  const router = useRouter();

  // Mode States
  const [simpleMode, setSimpleMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // For Simple mode step-by-step
  const [activeTab, setActiveTab] = useState<'canvas' | 'separation-view' | 'preview'>('canvas');
  const [toolTab, setToolTab] = useState<'select' | 'restore' | 'bg-separate' | 'motif-extract' | 'repeat' | 'saree-designer' | 'colorways' | 'separations'>('select');

  // Canvas Workspace States
  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | null>(null);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<CanvasItem[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasItem[][]>([]);

  // DB States
  const [layers, setLayers] = useState<DBLayer[]>(initialLayers);
  const [screens, setScreens] = useState<DBScreen[]>(initialScreens);
  const [credits, setCredits] = useState((user.creditWallet?.monthlyCredits || 0) + (user.creditWallet?.purchasedCredits || 0));

  // Tools Configuration States
  const [sareeSettings, setSareeSettings] = useState({
    length: 5.5,
    width: 44,
    border: 4,
    pallu: 36
  });

  const [repeatSettings, setRepeatSettings] = useState({
    type: 'Half Drop',
    width: 12,
    height: 12,
    horizontalGap: 2,
    verticalGap: 2,
    rotationVariation: 0,
    checkSeams: false
  });

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [screenTolerance, setScreenTolerance] = useState(50);
  const [screenDensity, setScreenDensity] = useState(100);
  const [activeScreenToggles, setActiveScreenToggles] = useState<Record<string, boolean>>({});

  // Tool Action Modals
  const [creditModal, setCreditModal] = useState<{ isOpen: boolean; cost: number; action: () => void; reason: string } | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'restore' | 'rebuild' | 'complete' | 'extend'>('restore');
  const [restoreSlider, setRestoreSlider] = useState(50);
  const [restoreApplied, setRestoreApplied] = useState(false);
  const [selectedArea, setSelectedArea] = useState<'rect' | 'brush' | 'lasso'>('brush');
  const [isDrawingMask, setIsDrawingMask] = useState(false);

  // Colorway States
  const [originalColors, setOriginalColors] = useState<string[]>(['#800020', '#D4AF37', '#0A3B23', '#F3C623', '#1A5F7A', '#1E1E1E']);
  const [activePalette, setActivePalette] = useState<string[]>(['#800020', '#D4AF37', '#0A3B23', '#F3C623', '#1A5F7A', '#1E1E1E']);

  // Load project's initial canvas items from V1 version
  useEffect(() => {
    if (project.versions && project.versions.length > 0) {
      try {
        const state = JSON.parse(project.versions[0].canvasState);
        if (state.items) {
          setCanvasItems(state.items);
        }
        if (state.sareeSettings) {
          setSareeSettings(state.sareeSettings);
        }
      } catch (e) {
        console.error('Failed to parse initial canvas state', e);
      }
    }

    // Load active screen toggles
    const initialToggles: Record<string, boolean> = {};
    initialScreens.forEach(s => {
      initialToggles[s.id] = true;
    });
    setActiveScreenToggles(initialToggles);
  }, [project, initialScreens]);

  // Keep track of history
  const saveToHistory = (newItems: CanvasItem[]) => {
    setUndoStack(prev => [...prev, canvasItems]);
    setRedoStack([]); // Reset redo
    setCanvasItems(newItems);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, canvasItems]);
    setCanvasItems(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, canvasItems]);
    setCanvasItems(next);
  };

  // Canvas Mouse interaction
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || toolTab === 'select') {
      // Middle click or select mode background drag is panning
      if (e.target === containerRef.current || (e.target as SVGElement).id === 'canvas-svg') {
        setIsDraggingCanvas(true);
        setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    } else if (selectedId && isResizing) {
      const item = canvasItems.find(item => item.id === selectedId);
      if (!item) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panX) / (zoom / 100);
      const mouseY = (e.clientY - rect.top - panY) / (zoom / 100);

      // Handle corner resizing relative to item center
      const newWidth = Math.max(20, Math.abs(mouseX - item.x) * 2);
      const newHeight = Math.max(20, Math.abs(mouseY - item.y) * 2);

      const updated = canvasItems.map(it => {
        if (it.id === selectedId) {
          return { ...it, width: newWidth, height: newHeight };
        }
        return it;
      });
      setCanvasItems(updated);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Quick manipulation buttons
  const deleteSelected = () => {
    if (!selectedId) return;
    saveToHistory(canvasItems.filter(it => it.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const item = canvasItems.find(it => it.id === selectedId);
    if (!item) return;

    const duplicate: CanvasItem = {
      ...item,
      id: `copy-${Date.now()}`,
      x: item.x + 30,
      y: item.y + 30
    };
    saveToHistory([...canvasItems, duplicate]);
    setSelectedId(duplicate.id);
  };

  const flipSelected = (dir: 'x' | 'y') => {
    if (!selectedId) return;
    const updated = canvasItems.map(it => {
      if (it.id === selectedId) {
        return dir === 'x' ? { ...it, flipX: !it.flipX } : { ...it, flipY: !it.flipY };
      }
      return it;
    });
    saveToHistory(updated);
  };

  const rotateSelected = (deg: number) => {
    if (!selectedId) return;
    const updated = canvasItems.map(it => {
      if (it.id === selectedId) {
        return { ...it, rotation: (it.rotation + deg) % 360 };
      }
      return it;
    });
    saveToHistory(updated);
  };

  // Drag-and-drop saved library motif onto canvas
  const handleAddLibraryMotif = (motif: any) => {
    const newItem: CanvasItem = {
      id: `motif-${Date.now()}`,
      type: 'motif',
      src: motif.imageUrl,
      x: 200,
      y: 200,
      width: 250,
      height: 250,
      rotation: 0,
      flipX: false,
      flipY: false
    };
    saveToHistory([...canvasItems, newItem]);
    setSelectedId(newItem.id);
  };

  // Layers controls
  const toggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLayerLock = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const changeLayerOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    const dup: DBLayer = {
      ...layer,
      id: `layer-dup-${Date.now()}`,
      name: `${layer.name} Copy`,
      order: layers.length
    };
    setLayers([...layers, dup]);
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  };

  // Background and Texture Separation Trigger
  const triggerBackgroundSeparation = async () => {
    setRestoreProgress(true);
    // Simulate AI model processing
    await new Promise(r => setTimeout(r, 1500));
    setRestoreProgress(false);

    // Creates new layers in database representation
    const newLayers: DBLayer[] = [
      {
        id: 'layer-art',
        name: 'Isolated Artwork (Flowers & Paisleys)',
        type: 'artwork',
        order: 1,
        imageUrl: project.originalImageUrl,
        visible: true,
        locked: false,
        opacity: 1.0,
        metadata: null
      },
      {
        id: 'layer-bg',
        name: 'Crimson Silk Ground (Base)',
        type: 'background',
        order: 0,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
        visible: true,
        locked: true,
        opacity: 1.0,
        metadata: null
      },
      {
        id: 'layer-texture',
        name: 'Woven Fabric Grain',
        type: 'texture',
        order: 2,
        imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=200',
        visible: true,
        locked: false,
        opacity: 0.35,
        metadata: null
      }
    ];

    setLayers(newLayers);
    setToolTab('select');
  };

  // AI Restore / Healing Actions
  const startAIRestoration = (mode: 'restore' | 'rebuild' | 'complete' | 'extend') => {
    setRestoreMode(mode);
    const cost = (mode === 'rebuild' || mode === 'extend') ? 2 : 1;
    
    // Trigger Credit Confirmation Modal
    setCreditModal({
      isOpen: true,
      cost,
      reason: mode === 'restore' ? 'AI Healing and Cleanup' : mode === 'rebuild' ? 'Missing Pattern Generation' : mode === 'complete' ? 'Motif Completing' : 'Extend Canvas Borders',
      action: async () => {
        setCreditModal(null);
        setRestoreProgress(true);
        // Simulate processing progress
        await new Promise(r => setTimeout(r, 1600));
        setRestoreProgress(false);
        setRestoreApplied(true);
        setCredits((prev: number) => prev - cost);
        // Apply visual updates (healed border or upscale)
      }
    });
  };

  // Screen Optimizer & Merging
  const handleReduceScreens = () => {
    setCreditModal({
      isOpen: true,
      cost: 1,
      reason: 'AI Screen Color Optimization (10 to 6 screens)',
      action: async () => {
        setCreditModal(null);
        setRestoreProgress(true);
        await new Promise(r => setTimeout(r, 1200));
        setRestoreProgress(false);
        setCredits((prev: number) => prev - 1);
        
        // Remove 2 screen channels and merge colors
        setScreens(prev => prev.slice(0, 5));
      }
    });
  };

  // ZIP Production package Export
  const handleExportPackage = () => {
    setExportModalOpen(true);
  };

  const startExportProcessing = async () => {
    // Check balance
    if (credits < 2) {
      alert("Insufficient AI credits for high-resolution production package. Please buy credits.");
      return;
    }

    setExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExporting(false);
          setExportModalOpen(false);
          setCredits((prevCredits: number) => prevCredits - 2);
          
          // Trigger file download simulation
          alert("ZIP Package Generated Successfully!\n- Final Artwork (TIFF 300DPI)\n- 6 Grayscale Screen Separations (PNG)\n- Color Reference Sheet (PDF)\n- Production Spec Card");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Colorways Recolor Function
  const swapColor = (idx: number, newHex: string) => {
    const updated = [...activePalette];
    updated[idx] = newHex;
    setActivePalette(updated);
  };

  const applyColorwayPreset = (presetColors: string[]) => {
    setActivePalette(presetColors);
  };

  // Simple Mode Navigation Wizard
  const stepsList = [
    { num: 1, label: 'Reference Image', tab: 'select' },
    { num: 2, label: 'Restore Canvas', tab: 'restore' },
    { num: 3, label: 'Isolate Layers', tab: 'bg-separate' },
    { num: 4, label: 'Extract Motifs', tab: 'motif-extract' },
    { num: 5, label: 'Grid Repeat', tab: 'repeat' },
    { num: 6, label: 'Color Separation', tab: 'separations' },
    { num: 7, label: 'Production Export', tab: 'separations' }
  ];

  const handleStepClick = (stepObj: any) => {
    setCurrentStep(stepObj.num);
    setToolTab(stepObj.tab as any);
    if (stepObj.num === 6) setActiveTab('separation-view');
    else if (stepObj.num === 7) handleExportPackage();
    else setActiveTab('canvas');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
        
        {/* Logo & Project Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="text-xs font-bold text-zinc-500 hover:text-zinc-300"
          >
            ← Back to Dashboard
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <div>
            <h2 className="text-sm font-extrabold text-white leading-tight">{project.name}</h2>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{project.productType}</div>
          </div>
        </div>

        {/* Simple vs Professional mode switch */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-850 rounded-xl">
          <button
            onClick={() => setSimpleMode(false)}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${!simpleMode ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Professional Mode
          </button>
          <button
            onClick={() => {
              setSimpleMode(true);
              setCurrentStep(1);
              setToolTab('select');
            }}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${simpleMode ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Simple Mode (Guided)
          </button>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleUndo} 
              disabled={undoStack.length === 0}
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-900 transition-all"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-900 transition-all"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Zoom */}
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1 text-zinc-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="font-bold text-zinc-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(400, zoom + 25))} className="p-1 text-zinc-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Save & Export buttons */}
          <button className="flex items-center gap-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
            <Save className="w-3.5 h-3.5" />
            Save Layout
          </button>
          <button 
            onClick={handleExportPackage}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow shadow-rose-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export Package
          </button>
        </div>
      </header>

      {/* 2. SIMPLE MODE STEP WIZARD BAR */}
      {simpleMode && (
        <div className="bg-zinc-950 border-b border-zinc-900 py-3.5 px-6 flex items-center justify-center gap-4 shrink-0">
          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isActive = currentStep === st.num;
            return (
              <React.Fragment key={st.num}>
                <button
                  onClick={() => handleStepClick(st)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isActive 
                      ? 'border-rose-500 bg-rose-500/5 text-white'
                      : isCompleted
                      ? 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700'
                      : 'border-zinc-900 bg-zinc-950 text-zinc-600 cursor-not-allowed'
                  }`}
                  disabled={st.num > currentStep + 1}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isActive ? 'bg-rose-500 text-white' : isCompleted ? 'bg-zinc-800 text-rose-500' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {isCompleted ? '✓' : st.num}
                  </span>
                  {st.label}
                </button>
                {st.num < 7 && <div className="w-6 h-px bg-zinc-900" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* 3. CENTRAL PANEL: DOCK + WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT TOOL BAR DOCK (Only visible in Professional Mode) */}
        {!simpleMode && (
          <aside className="w-16 border-r border-zinc-900 bg-zinc-950 flex flex-col items-center py-4 justify-between shrink-0">
            <div className="space-y-4">
              {[
                { id: 'select', label: 'Select Layer', icon: FileImage },
                { id: 'restore', label: 'AI Restore', icon: Paintbrush },
                { id: 'bg-separate', label: 'Layer Split', icon: Layers },
                { id: 'motif-extract', label: 'Motif Extract', icon: Scissors },
                { id: 'repeat', label: 'Repeat Creator', icon: Grid },
                { id: 'saree-designer', label: 'Saree Preset', icon: Compass },
                { id: 'colorways', label: 'AI Colorways', icon: Palette },
                { id: 'separations', label: 'Screens Separator', icon: FileJson }
              ].map((tool) => {
                const isActive = toolTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setToolTab(tool.id as any);
                      if (tool.id === 'separations') setActiveTab('separation-view');
                      else setActiveTab('canvas');
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-rose-950/20 border border-rose-500/30 text-rose-500 shadow shadow-rose-500/5' 
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                    }`}
                    title={tool.label}
                  >
                    <tool.icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            <div className="text-zinc-500 hover:text-white p-2 rounded-lg cursor-pointer">
              <Settings className="w-5 h-5" />
            </div>
          </aside>
        )}

        {/* WORKSPACE DETAIL COLUMN */}
        <div className="w-72 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-900 shrink-0">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {toolTab === 'select' && 'Layer Settings'}
              {toolTab === 'restore' && 'AI Restoration'}
              {toolTab === 'bg-separate' && 'Separation Panel'}
              {toolTab === 'motif-extract' && 'Motif Extractor'}
              {toolTab === 'repeat' && 'Seamless Repeats'}
              {toolTab === 'saree-designer' && 'Saree Preset'}
              {toolTab === 'colorways' && 'AI Colorway Options'}
              {toolTab === 'separations' && 'Print Color Separation'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* SELECT/LAYER SETTINGS PANEL */}
            {toolTab === 'select' && (
              <div className="space-y-4 text-xs">
                {selectedId ? (
                  <>
                    <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3">
                      <div className="font-bold text-white uppercase text-[10px] tracking-wider text-rose-500">Selected Motif Properties</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-zinc-500">Width</span>
                          <div className="text-zinc-200 font-bold mt-0.5">{Math.round(canvasItems.find(it => it.id === selectedId)?.width || 0)} px</div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Height</span>
                          <div className="text-zinc-200 font-bold mt-0.5">{Math.round(canvasItems.find(it => it.id === selectedId)?.height || 0)} px</div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Rotation</span>
                          <div className="text-zinc-200 font-bold mt-0.5">{canvasItems.find(it => it.id === selectedId)?.rotation || 0}°</div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Position</span>
                          <div className="text-zinc-200 font-bold mt-0.5">X: {Math.round(canvasItems.find(it => it.id === selectedId)?.x || 0)}, Y: {Math.round(canvasItems.find(it => it.id === selectedId)?.y || 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Transform Buttons */}
                    <div className="space-y-2">
                      <span className="text-zinc-500 font-medium">Quick Transformations</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => rotateSelected(90)} className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 font-semibold flex items-center justify-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5" />
                          Rotate 90°
                        </button>
                        <button onClick={duplicateSelected} className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 font-semibold flex items-center justify-center gap-1.5">
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate
                        </button>
                        <button onClick={() => flipSelected('x')} className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 font-semibold text-center">
                          Flip Horizontal
                        </button>
                        <button onClick={() => flipSelected('y')} className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 font-semibold text-center">
                          Flip Vertical
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={deleteSelected}
                      className="w-full py-3 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/40 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Motif
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    Click an item on the canvas to view and adjust its properties.
                  </div>
                )}
              </div>
            )}

            {/* AI RESTORE PANEL */}
            {toolTab === 'restore' && (
              <div className="space-y-5 text-xs">
                <div className="space-y-2">
                  <span className="text-zinc-500 font-medium">Select Selection Brush</span>
                  <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
                    {['brush', 'rect', 'lasso'].map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedArea(b as any)}
                        className={`flex-1 py-1.5 text-center rounded-lg font-bold uppercase text-[10px] ${selectedArea === b ? 'bg-rose-600 text-white' : 'text-zinc-400'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-500 font-medium">Select Area & Choose AI Operation</span>
                  <p className="text-[10px] text-zinc-600 leading-snug">Draw a mask over damaged areas, dirt, folds, or cropped sections of your reference.</p>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => startAIRestoration('restore')}
                    className="w-full text-left p-3.5 bg-zinc-900/50 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      Heal Damage & Clean Noise
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 leading-snug">Remove folding marks, blur, dirt spots, and WhatsApp compression. (1 Credit)</div>
                  </button>

                  <button 
                    onClick={() => startAIRestoration('rebuild')}
                    className="w-full text-left p-3.5 bg-zinc-900/50 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      Rebuild Missing Area
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 leading-snug">Generate matching continuations for cropped boundaries, keeping texture. (2 Credits)</div>
                  </button>

                  <button 
                    onClick={() => startAIRestoration('complete')}
                    className="w-full text-left p-3.5 bg-zinc-900/50 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Complete Motif Structure
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 leading-snug">AI completes half-cropped lotus, leaf, or paisley shapes dynamically. (1 Credit)</div>
                  </button>

                  <button 
                    onClick={() => startAIRestoration('extend')}
                    className="w-full text-left p-3.5 bg-zinc-900/50 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      Extend Canvas Bounds
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 leading-snug">Extend the background pattern boundary beyond the original frame. (2 Credits)</div>
                  </button>
                </div>

                {restoreApplied && (
                  <div className="p-4 bg-zinc-900/80 border border-rose-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      AI Restoration Applied
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Original</span>
                        <span>Restored</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={restoreSlider}
                        onChange={(e) => setRestoreSlider(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setRestoreApplied(false)} className="flex-1 py-2 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 font-semibold">Reject</button>
                      <button onClick={() => setRestoreApplied(false)} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold">Accept</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BACKGROUND AND TEXTURE SEPARATION PANEL */}
            {toolTab === 'bg-separate' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-2">
                  <div className="font-bold text-white text-[10px] uppercase tracking-wider">AI Layer Splitter</div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Splits the image into separate assets (Main design, background base fabric, texture, shadows) instead of simple background removal.</p>
                </div>

                <button
                  onClick={triggerBackgroundSeparation}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-rose-600/10"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  Split Image Layers
                </button>
              </div>
            )}

            {/* MOTIF EXTRACTION PANEL */}
            {toolTab === 'motif-extract' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-2">
                  <div className="font-bold text-white text-[10px] uppercase tracking-wider">Automatic Motif Detector</div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">AI detects repeating outlines in the reference and extracts them as independent assets.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Detected Motifs</span>
                  
                  {/* Bounding box list */}
                  <div className="space-y-2">
                    {[
                      { name: 'Kalka Paisley 01', size: '250 × 350 px', category: 'Paisleys' },
                      { name: 'Lotus Bud 02', size: '180 × 180 px', category: 'Flowers' },
                      { name: 'Marigold Petal 03', size: '120 × 120 px', category: 'Leaves' }
                    ].map((m, idx) => (
                      <div key={idx} className="p-2.5 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-200">{m.name}</div>
                          <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{m.category} • {m.size}</div>
                        </div>
                        <button 
                          onClick={() => {
                            // Add motif as canvas item
                            const newItem: CanvasItem = {
                              id: `ext-motif-${idx}-${Date.now()}`,
                              type: 'motif',
                              src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
                              x: 200,
                              y: 200,
                              width: 180,
                              height: 180,
                              rotation: 0,
                              flipX: false,
                              flipY: false
                            };
                            saveToHistory([...canvasItems, newItem]);
                            setSelectedId(newItem.id);
                          }}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-[10px] font-bold text-rose-400"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REPEAT CREATOR PANEL */}
            {toolTab === 'repeat' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-zinc-500 font-medium">Repeat Grid Type</span>
                  <select
                    value={repeatSettings.type}
                    onChange={(e) => setRepeatSettings({ ...repeatSettings, type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-xl outline-none focus:border-rose-500"
                  >
                    <option value="Straight Repeat">Straight Repeat</option>
                    <option value="Half Drop">Half Drop (Offset 1/2)</option>
                    <option value="Brick Repeat">Brick Repeat</option>
                    <option value="Mirror Repeat">Mirror Repeat</option>
                    <option value="Toss Repeat">Toss Repeat</option>
                    <option value="Random Repeat">Random Repeat</option>
                    <option value="Border Repeat">Border Repeat</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 font-medium">Repeat Width</span>
                    <input 
                      type="text" 
                      value={repeatSettings.width + ' in'} 
                      onChange={() => {}}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2.5 rounded-xl text-zinc-300 outline-none text-center" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 font-medium">Repeat Height</span>
                    <input 
                      type="text" 
                      value={repeatSettings.height + ' in'} 
                      onChange={() => {}}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2.5 rounded-xl text-zinc-300 outline-none text-center" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 font-medium">Horizontal Gap</span>
                    <input 
                      type="text" 
                      value={repeatSettings.horizontalGap + ' mm'} 
                      onChange={() => {}}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2.5 rounded-xl text-zinc-300 outline-none text-center" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 font-medium">Vertical Gap</span>
                    <input 
                      type="text" 
                      value={repeatSettings.verticalGap + ' mm'} 
                      onChange={() => {}}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2.5 rounded-xl text-zinc-300 outline-none text-center" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                  <span className="text-zinc-300 font-bold">Check Layout Seams</span>
                  <input 
                    type="checkbox" 
                    checked={repeatSettings.checkSeams}
                    onChange={(e) => setRepeatSettings({ ...repeatSettings, checkSeams: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>
              </div>
            )}

            {/* SAREE DESIGNER MODE PANEL */}
            {toolTab === 'saree-designer' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-2">
                  <div className="font-bold text-white text-[10px] uppercase tracking-wider">Saree Presets Grid</div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Configure Saree regions (Pallu, Body, Border bands). Guidelines are overlayed onto the canvas editor.</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-zinc-500 font-medium font-semibold uppercase text-[10px]">Saree Specifications</span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Total Length</span>
                      <input 
                        type="text" 
                        value={sareeSettings.length + ' meters'}
                        onChange={() => {}}
                        className="bg-zinc-950 border border-zinc-850 text-center w-28 py-1.5 rounded-lg font-bold text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Saree Width</span>
                      <input 
                        type="text" 
                        value={sareeSettings.width + ' inches'}
                        onChange={() => {}}
                        className="bg-zinc-950 border border-zinc-850 text-center w-28 py-1.5 rounded-lg font-bold text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Border Width</span>
                      <input 
                        type="text" 
                        value={sareeSettings.border + ' inches'}
                        onChange={() => {}}
                        className="bg-zinc-950 border border-zinc-850 text-center w-28 py-1.5 rounded-lg font-bold text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Pallu Length</span>
                      <input 
                        type="text" 
                        value={sareeSettings.pallu + ' inches'}
                        onChange={() => {}}
                        className="bg-zinc-950 border border-zinc-850 text-center w-28 py-1.5 rounded-lg font-bold text-zinc-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Zone Overlays</span>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-xl text-center">
                    <button className="py-1 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">Body</button>
                    <button className="py-1 rounded text-[10px] font-extrabold uppercase text-zinc-400 hover:text-white">Border</button>
                    <button className="py-1 rounded text-[10px] font-extrabold uppercase text-zinc-400 hover:text-white">Pallu</button>
                  </div>
                </div>
              </div>
            )}

            {/* COLORWAY GENERATOR PANEL */}
            {toolTab === 'colorways' && (
              <div className="space-y-5 text-xs">
                <div className="space-y-2">
                  <span className="text-zinc-500 font-medium">Extract Colors Palette</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activePalette.map((col, idx) => (
                      <div key={idx} className="relative group">
                        <input 
                          type="color" 
                          value={col}
                          onChange={(e) => swapColor(idx, e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-800 bg-zinc-900/50"
                        />
                        <div className="absolute top-[42px] left-1/2 -translate-x-1/2 bg-zinc-950 px-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          {col}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">AI Generated Colorways</span>
                  
                  {[
                    { name: 'Bridal Crimson & Gold', colors: ['#800020', '#D4AF37', '#FFFDD0', '#301934', '#E6C280'] },
                    { name: 'Mint Jasmine & Lavender', colors: ['#E8F5E9', '#F3E5F5', '#E1F5FE', '#FFFDE7', '#ECEFF1'] },
                    { name: 'Peacock Blue & Orange', colors: ['#005A70', '#E05A10', '#F2D388', '#002A38', '#A9F1DF'] },
                    { name: 'Mustard Haldi & Violet', colors: ['#E1AD01', '#3F0071', '#FBF4EC', '#610C9F', '#FFF685'] }
                  ].map((preset, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-700 rounded-xl space-y-2 cursor-pointer transition-all"
                      onClick={() => applyColorwayPreset(preset.colors)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-zinc-200">{preset.name}</div>
                        <span className="text-[9px] text-zinc-500 font-semibold">Preset</span>
                      </div>
                      <div className="flex gap-1">
                        {preset.colors.map((c, i) => (
                          <div key={i} className="flex-1 h-3.5 rounded" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN COLOR SEPARATION PANEL */}
            {toolTab === 'separations' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider text-[10px]">Print Screens ({screens.length})</span>
                  <button 
                    onClick={handleReduceScreens}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Optimize Screens
                  </button>
                </div>

                <div className="space-y-2">
                  {screens.map((sc) => {
                    const isSelected = selectedScreenId === sc.id;
                    const isToggled = activeScreenToggles[sc.id] !== false;

                    return (
                      <div 
                        key={sc.id}
                        className={`p-3 bg-zinc-900/30 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'border-rose-500 bg-rose-950/5' : 'border-zinc-850 hover:border-zinc-800'
                        }`}
                        onClick={() => setSelectedScreenId(sc.id)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Color block */}
                          <div className="w-7 h-7 rounded-lg border border-zinc-800" style={{ backgroundColor: sc.hex }} />
                          <div>
                            <div className="font-bold text-zinc-200">{sc.colorName}</div>
                            <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Screen 0{sc.order} • {sc.hex}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setActiveScreenToggles({
                                ...activeScreenToggles,
                                [sc.id]: !isToggled
                              });
                            }}
                            className={`p-1.5 rounded-lg border ${isToggled ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-rose-500/20 text-rose-500 bg-rose-950/10'}`}
                            title={isToggled ? 'Hide film' : 'Show film'}
                          >
                            {isToggled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedScreenId && (
                  <div className="border-t border-zinc-900 pt-4 space-y-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Screen Tolerance adjustments</span>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Mask Color Tolerance</span>
                          <span className="text-zinc-200 font-bold">{screenTolerance}%</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="100"
                          value={screenTolerance}
                          onChange={(e) => setScreenTolerance(Number(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Print Ink Density</span>
                          <span className="text-zinc-200 font-bold">{screenDensity}%</span>
                        </div>
                        <input 
                          type="range"
                          min="50"
                          max="100"
                          value={screenDensity}
                          onChange={(e) => setScreenDensity(Number(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* DOCK: PRODUCTION CHECKS (Advisory validation warnings) */}
          <div className="p-4 border-t border-zinc-900 shrink-0 bg-zinc-950 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Production Check
              </span>
              <span className="text-[9px] text-zinc-500 font-semibold">Advisory</span>
            </div>
            
            <div className="space-y-2 text-[10px] leading-snug">
              <div className="flex items-start gap-2 bg-zinc-900/40 p-2 rounded-xl border border-zinc-900">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-zinc-400">All screens contain printable color separations.</span>
              </div>
              
              <div className="flex items-start gap-2 bg-zinc-900/40 p-2 rounded-xl border border-amber-950/20">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-zinc-400">Screen 3 and 4 contain visually similar colors. Merge recommended.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. WORKSPACE CENTER VIEWPORT (CANVAS / PRINT PREVIEW) */}
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col">
          
          {/* Top Tabs (Canvas / Separations / Combined Preview) */}
          <div className="h-12 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center gap-6 shrink-0 z-20">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`h-full text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors ${
                activeTab === 'canvas' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Design Canvas
            </button>
            <button
              onClick={() => {
                setActiveTab('separation-view');
                setToolTab('separations');
              }}
              className={`h-full text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors ${
                activeTab === 'separation-view' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Grayscale Separation Film
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`h-full text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors ${
                activeTab === 'preview' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Combined Print Preview
            </button>
          </div>

          {/* Canvas Render Container */}
          <div 
            ref={containerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-zinc-950 flex items-center justify-center"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }}
          >
            
            {/* The actual Zoomed Canvas */}
            <div 
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: isDraggingCanvas ? 'none' : 'transform 0.15s ease-out'
              }}
              className="relative w-[800px] h-[600px] bg-zinc-950 shadow-2xl border border-zinc-900 overflow-hidden shrink-0 select-none"
            >
              
              {/* CANVAS RENDER MODES */}
              
              {/* MODE A: STANDARD CANVAS LAYERS */}
              {activeTab === 'canvas' && (
                <>
                  {/* Render Layers in background order */}
                  {layers.filter(l => l.visible).map((lay) => {
                    if (lay.type === 'background') {
                      return (
                        <div 
                          key={lay.id}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ 
                            opacity: lay.opacity,
                            backgroundColor: activePalette[0] // Bind base ground colorway
                          }}
                        />
                      );
                    }
                    if (lay.type === 'texture') {
                      return (
                        <div 
                          key={lay.id}
                          className="absolute inset-0 w-full h-full mix-blend-multiply opacity-[0.25] pointer-events-none bg-cover"
                          style={{ 
                            backgroundImage: `url('${lay.imageUrl}')` 
                          }}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Render guidelines if Saree designer active */}
                  {toolTab === 'saree-designer' && (
                    <div className="absolute inset-0 w-full h-full border-4 border-rose-500/25 pointer-events-none z-10">
                      {/* Pallu boundary line (vertical line at 250px) */}
                      <div className="absolute top-0 bottom-0 left-[250px] border-r border-dashed border-rose-500 flex items-center pl-2 text-[10px] font-bold text-rose-400 select-none">
                        PALLU SECTION (36 in)
                      </div>
                      
                      {/* Saree body tag */}
                      <div className="absolute top-1/2 left-[400px] text-[10px] font-bold text-rose-400 select-none">
                        SAREE BODY GRID
                      </div>

                      {/* Border boundaries (top and bottom border tracks) */}
                      <div className="absolute top-[80px] left-0 right-0 border-b border-dashed border-rose-500" />
                      <div className="absolute bottom-[80px] left-0 right-0 border-t border-dashed border-rose-500" />
                      <div className="absolute top-[30px] left-8 text-[9px] font-bold text-rose-400 select-none">TOP BORDER (4 in)</div>
                      <div className="absolute bottom-[30px] left-8 text-[9px] font-bold text-rose-400 select-none">BOTTOM BORDER (4 in)</div>
                    </div>
                  )}

                  {/* Render repeats if repeats active */}
                  {toolTab === 'repeat' && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25 grid grid-cols-3 grid-rows-3 border border-zinc-800">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-dashed border-zinc-800 flex items-center justify-center text-[10px] text-zinc-700">Tiling Cell</div>
                      ))}
                    </div>
                  )}

                  {/* Canvas Items (motifs/borders) */}
                  {canvasItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    const isLocked = layers.find(l => l.type === 'motif')?.locked;

                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!isLocked) {
                            setSelectedId(item.id);
                            setToolTab('select');
                          }
                        }}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                          height: `${item.height}px`,
                          transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                          cursor: isLocked ? 'default' : 'move'
                        }}
                        className={`absolute flex items-center justify-center ${
                          isSelected && !isLocked ? 'border-2 border-rose-500' : 'hover:border border-zinc-700'
                        }`}
                      >
                        <img 
                          src={item.src} 
                          alt="motif" 
                          className="w-full h-full object-contain pointer-events-none"
                          style={{
                            // If colorway is updated, apply hue-rotates or mix ink coloring
                            filter: activePalette[1] ? `drop-shadow(0 0 1px ${activePalette[1]})` : 'none'
                          }}
                        />

                        {/* Corner Resize Handles */}
                        {isSelected && !isLocked && (
                          <>
                            <div 
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setResizeHandle('se');
                              }}
                              className="absolute w-3.5 h-3.5 bg-white border border-zinc-950 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize z-20"
                            />
                            <div className="absolute w-3.5 h-3.5 bg-white border border-zinc-950 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" />
                            <div className="absolute w-3.5 h-3.5 bg-white border border-zinc-950 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" />
                            <div className="absolute w-3.5 h-3.5 bg-white border border-zinc-950 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 pointer-events-none z-20" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* MODE B: GRAYSCALE SEPARATION FILM */}
              {activeTab === 'separation-view' && (
                <div className="absolute inset-0 w-full h-full bg-zinc-950 flex flex-col items-center justify-center">
                  {selectedScreenId ? (
                    <>
                      {/* Grayscale filter simulates stencil */}
                      <div 
                        className="w-[800px] h-[600px] bg-cover bg-center grayscale filter invert contrast-[3] saturate-0 brightness-[1.5]"
                        style={{ 
                          backgroundImage: `url('${project.originalImageUrl}')`,
                          opacity: screenDensity / 100
                        }}
                      />
                      <div className="absolute bottom-6 left-6 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-wider shadow">
                        Film Screen: {screens.find(s => s.id === selectedScreenId)?.colorName} (Film Tolerance: {screenTolerance}%)
                      </div>
                    </>
                  ) : (
                    <div className="text-zinc-500 text-xs text-center space-y-3">
                      <FileImage className="w-8 h-8 mx-auto" />
                      <div>Select a print screen from the left panel to inspect its grayscale stencil film.</div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE C: COMBINED PRINT PREVIEW */}
              {activeTab === 'preview' && (
                <div className="absolute inset-0 w-full h-full bg-zinc-950 relative">
                  {/* Base Layer */}
                  <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: activePalette[0] }} />

                  {/* Print overlays based on active toggles */}
                  {screens.map((sc, idx) => {
                    const isVisible = activeScreenToggles[sc.id] !== false;
                    if (!isVisible) return null;

                    return (
                      <div 
                        key={sc.id}
                        className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-multiply opacity-90"
                        style={{ 
                          backgroundImage: `url('${project.originalImageUrl}')`,
                          // Dynamically hue-rotate or tint using background blends
                          filter: `contrast(1.2) brightness(0.9) drop-shadow(0 0 1px ${sc.hex})`
                        }}
                      />
                    );
                  })}

                  <div className="absolute top-6 left-6 bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 border border-zinc-800 rounded-full text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                    Simulated Fabric Print (Combined Layer)
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Dock: Layers manager */}
          <div className="h-44 border-t border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
            <div className="h-10 border-b border-zinc-900 px-6 flex items-center justify-between shrink-0 text-xs text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Layers stack</span>
              <span className="text-[10px]">Opacity</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {layers.map((l) => (
                <div 
                  key={l.id}
                  className="flex items-center justify-between px-3 py-2 bg-zinc-900/30 border border-zinc-900/50 hover:border-zinc-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {/* Layer Visibility */}
                    <button 
                      onClick={() => toggleLayerVisibility(l.id)} 
                      className="text-zinc-500 hover:text-white"
                    >
                      {l.visible ? <Eye className="w-4 h-4 text-zinc-300" /> : <EyeOff className="w-4 h-4 text-zinc-600" />}
                    </button>
                    
                    {/* Layer Lock */}
                    <button 
                      onClick={() => toggleLayerLock(l.id)} 
                      className="text-zinc-500 hover:text-white"
                    >
                      {l.locked ? <Lock className="w-3.5 h-3.5 text-zinc-400" /> : <Unlock className="w-3.5 h-3.5 text-zinc-600" />}
                    </button>

                    {/* Layer name */}
                    <span className="text-xs font-semibold text-zinc-300">{l.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                    {/* Opacity slider */}
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={l.opacity * 100}
                      onChange={(e) => changeLayerOpacity(l.id, Number(e.target.value) / 100)}
                      className="w-20 accent-rose-500" 
                    />
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => duplicateLayer(l.id)} className="p-1 hover:text-white text-zinc-500"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteLayer(l.id)} className="p-1 hover:text-red-400 text-zinc-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: REUSABLE LIBRARY ASSET GRID */}
        <aside className="w-64 border-l border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-900">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Library Assets</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Extracted Motif Bank</div>
            
            <div className="grid grid-cols-2 gap-2">
              {libraryMotifs.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => handleAddLibraryMotif(m)}
                  className="p-2 border border-zinc-900 bg-zinc-900/10 hover:border-zinc-700 rounded-2xl cursor-pointer group text-center space-y-2"
                >
                  <img src={m.imageUrl} alt={m.name} className="w-full aspect-square object-cover rounded-xl border border-zinc-800" />
                  <div className="text-[9px] font-semibold text-zinc-400 group-hover:text-white truncate px-1">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* CONFIRMATION CREDIT MODAL */}
      {creditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white">AI Credits Transaction</h3>
                <p className="text-zinc-400 text-xs mt-1">This operation will deduct active credits from your credit wallet.</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Operation</span>
                <span className="text-white font-bold">{creditModal.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cost</span>
                <span className="text-amber-400 font-bold">{creditModal.cost} AI Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Remaining Balance After</span>
                <span className="text-zinc-300 font-bold">{credits - creditModal.cost} Credits</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs font-bold">
              <button 
                onClick={() => setCreditModal(null)} 
                className="px-4 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={creditModal.action}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PROGRESS MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white">Export Production Package</h3>
                <p className="text-zinc-400 text-xs mt-1">Generates a complete ZIP archive for textile print factories.</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Separation Screen Files</span>
                <span className="text-zinc-300 font-bold">{screens.length} Screens (300 DPI TIFFs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Specification Sheet</span>
                <span className="text-zinc-300 font-bold">Generated PDF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Operation Cost</span>
                <span className="text-rose-400 font-bold">2 AI Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Remaining Balance</span>
                <span className="text-zinc-300 font-bold">{credits - 2} Credits</span>
              </div>
            </div>

            {exporting ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Processing high-res matrices...</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-200" style={{ width: `${exportProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end text-xs font-bold">
                <button 
                  onClick={() => setExportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={startExportProcessing}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirm & Export Package
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOADER OVERLAY */}
      {restoreProgress && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-850" />
            <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-500">AI</div>
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Running AI Model...</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Estimating bounds, cleaning pixels, and mapping stencil channels.</p>
          </div>
        </div>
      )}

    </div>
  );
}
