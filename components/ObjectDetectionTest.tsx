"use client";

import React, { useState } from 'react';
import { Source, metadataBySource } from '@/lib/constants/test-images';
import { DetectedObject, WorkflowStep } from '@/lib/genai/types';
import { performDetection, performRestoration, performColorization, performCinematization } from '@/app/actions/detection';
import StatusBadge from './StatusBadge';
import ImageModal from './ImageModal';
import DetectionDataTable from './DetectionDataTable';
import { useConfig } from './ConfigContext';

const ObjectDetectionTest: React.FC = () => {
  const { apiKey, selectedModel, selectedImageModel, setIsSettingsOpen } = useConfig();
  const [selectedSource, setSelectedSource] = useState<Source>(Source.INCUNABLE);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [activeView, setActiveView] = useState<'original' | 'processed' | 'table'>('original');
  const [isRestoring, setIsRestoring] = useState(false);
  const [isColorizing, setIsColorizing] = useState(false);
  const [isCinematizing, setIsCinematizing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSpecializedDetectionEnabled, setIsSpecializedDetectionEnabled] = useState(true);
  const [base64Data, setBase64Data] = useState<string | undefined>(undefined);
  
  // Prompt configuration
  const [restorationMode, setRestorationMode] = useState<'default' | 'tilted' | 'warped' | 'custom'>('default');
  const [customRestorationPrompt, setCustomRestorationPrompt] = useState('');
  const [colorizationMode, setColorizationMode] = useState<'default' | 'watercolor' | 'painting' | 'digital-graphic' | 'photo' | 'custom'>('default');
  const [customColorizationPrompt, setCustomColorizationPrompt] = useState('');

  const [cinematizationMode, setCinematizationMode] = useState<'default' | 'custom'>('default');
  const [customCinematizationPrompt, setCustomCinematizationPrompt] = useState('');

  const checkApiKey = () => {
    if (!apiKey || apiKey.trim() === '') {
      setIsSettingsOpen(true);
      return false;
    }
    return true;
  };

  const handleColorize = async () => {
    if (!checkApiKey()) return;
    setIsColorizing(true);
    try {
      let prompt: string | undefined = undefined;
      
      if (colorizationMode === 'watercolor') {
        const { WATERCOLOR_PROMPT } = await import('@/lib/genai/prompts');
        prompt = WATERCOLOR_PROMPT;
      } else if (colorizationMode === 'painting') {
        const { PAINTING_PROMPT } = await import('@/lib/genai/prompts');
        prompt = PAINTING_PROMPT;
      } else if (colorizationMode === 'digital-graphic') {
        const { DIGITAL_GRAPHIC_PROMPT } = await import('@/lib/genai/prompts');
        prompt = DIGITAL_GRAPHIC_PROMPT;
      } else if (colorizationMode === 'photo') {
        const { PHOTO_PROMPT } = await import('@/lib/genai/prompts');
        prompt = PHOTO_PROMPT;
      } else if (colorizationMode === 'custom' && customColorizationPrompt.trim()) {
        prompt = customColorizationPrompt;
      }

      const result = await performColorization(selectedSource, prompt, apiKey, selectedImageModel, base64Data);
      if (result) {
        setWorkflow(result);
        setActiveView('processed');
      }
    } catch (error) {
      console.error("Colorization failed:", error);
    } finally {
      setIsColorizing(false);
    }
  };

  const handleCinematize = async () => {
    if (!checkApiKey()) return;
    setIsCinematizing(true);
    try {
      let prompt: string | undefined = undefined;
      if (cinematizationMode === 'custom' && customCinematizationPrompt.trim()) {
        prompt = customCinematizationPrompt;
      }
      const result = await performCinematization(selectedSource, prompt, apiKey, selectedImageModel, base64Data);
      if (result) {
        setWorkflow(result);
        setActiveView('processed');
      }
    } catch (error) {
      console.error("Cinematization failed:", error);
    } finally {
      setIsCinematizing(false);
    }
  };

  const handleRestore = async () => {
    if (!checkApiKey()) return;
    setIsRestoring(true);
    try {
      let prompt: string | undefined = undefined;
      
      if (restorationMode === 'tilted') {
        const { TILTED_VISUAL_PROMPT } = await import('@/lib/genai/prompts');
        prompt = TILTED_VISUAL_PROMPT;
      } else if (restorationMode === 'warped') {
        const { WARPED_VISUAL_PROMPT } = await import('@/lib/genai/prompts');
        prompt = WARPED_VISUAL_PROMPT;
      } else if (restorationMode === 'custom' && customRestorationPrompt.trim()) {
        prompt = customRestorationPrompt;
      }

      const result = await performRestoration(selectedSource, prompt, apiKey, selectedImageModel, base64Data);
      if (result) {
        setWorkflow(result);
        setActiveView('processed');
      }
    } catch (error) {
      console.error("Restoration failed:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDetect = async () => {
    if (!checkApiKey()) return;
    setIsDetecting(true);
    setDetections([]);
    setWorkflow(null);
    setActiveView('original');
    
    try {
      let prompt: string | undefined;
      let mediaResolution: any;

      if (selectedSource === Source.ELECTRONICS && isSpecializedDetectionEnabled) {
        const { ELECTRONIC_COMPONENT_DETECTION_PROMPT } = await import('@/lib/genai/prompts');
        const { PartMediaResolutionLevel } = await import('@/lib/genai/types');
        prompt = ELECTRONIC_COMPONENT_DETECTION_PROMPT;
        mediaResolution = PartMediaResolutionLevel.HIGH; 
      }

      // Client-side fetch fallback for LOC images to bypass server IP blocking
      let currentBase64 = base64Data;
      if (!currentBase64 && selectedSource.includes('loc.gov')) {
        try {
          console.log("🌐 [CLIENT] Fetching LOC image directly in browser...");
          const response = await fetch(selectedSource);
          if (response.ok) {
            const blob = await response.blob();
            currentBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
              };
              reader.readAsDataURL(blob);
            });
            setBase64Data(currentBase64);
            console.log("✅ [CLIENT] Client-side fetch successful.");
          } else {
            console.warn(`⚠️ [CLIENT] Client-side fetch failed with status: ${response.status}`);
          }
        } catch (e) {
          console.error("❌ [CLIENT] Client-side fetch error:", e);
        }
      }

      const result = await performDetection(selectedSource, selectedModel, prompt, mediaResolution, apiKey, currentBase64);
      if (result && result.detectedObjects) {
        setWorkflow(result);
        setDetections(result.detectedObjects);
      }
    } catch (error) {
      console.error("Detection failed:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const metadata = metadataBySource[selectedSource];

  return (
    <div className="flex bg-zinc-950 h-[calc(100vh-6rem)] animate-slow-fade-in relative">
      {/* Left Sidebar: Image Selection */}
      <aside className="w-80 border-r border-white/5 flex flex-col glass z-10 h-full">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Test Sources</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {Object.values(Source).map((src) => (
            <button
              key={src}
              onClick={() => {
                setSelectedSource(src as Source);
                setDetections([]);
                setWorkflow(null);
                setActiveView('original');
              }}
              className={`w-full text-left group p-2 rounded-2xl transition-all duration-300 ${
                selectedSource === src 
                  ? "bg-white/10 ring-1 ring-white/20 shadow-xl" 
                  : "hover:bg-white/5"
              }`}
            >
              <div className="aspect-video mb-3 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="px-2 pb-2">
                <p className="text-xs font-bold text-zinc-200 truncate">{metadataBySource[src as Source].title}</p>
                <p className="text-[10px] text-zinc-500 mt-1 truncate italic">{metadataBySource[src as Source].creditLine}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Workspace Header */}
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center glass sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Visual AI Workspace</h1>
            <div className="flex gap-4 mt-1 items-center">
               <StatusBadge 
                status={isDetecting ? 'processing' : detections.length > 0 ? 'completed' : 'idle'} 
                label={isDetecting ? 'Detecting...' : detections.length > 0 ? `${detections.length} Objects Found` : 'Ready to Detect'}
              />
              {workflow?.imagesByStep?.[WorkflowStep.RESTORED] && (
                <StatusBadge status="completed" label="Processable" />
              )}
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            {selectedSource === Source.ELECTRONICS && (
              <label 
                className="flex items-center gap-2 mr-2 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors"
                title="Toggle specialized electronic component detection prompt"
              >
                <input 
                  type="checkbox" 
                  checked={isSpecializedDetectionEnabled} 
                  onChange={(e) => setIsSpecializedDetectionEnabled(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                Specialized Prompt
              </label>
            )}
             <button
              onClick={handleDetect}
              disabled={isDetecting}
              className="px-6 py-2 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-full font-bold text-sm transition-all shadow-lg"
            >
              {isDetecting ? "Running..." : "Run Detection"}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2 self-center" />
            <div className="flex gap-2">
              <div className="flex bg-black/40 border border-white/10 rounded-full pr-1 overflow-hidden transition-all focus-within:border-white/30">
                <select 
                  className="bg-transparent text-xs text-zinc-300 px-3 outline-none cursor-pointer appearance-none border-r border-white/10 custom-select"
                  value={restorationMode}
                  onChange={(e) => setRestorationMode(e.target.value as 'default' | 'tilted' | 'warped' | 'custom')}
                  disabled={isDetecting || isRestoring || detections.length === 0}
                >
                  <option value="default" className="bg-zinc-900">Default</option>
                  <option value="tilted" className="bg-zinc-900">Tilted</option>
                  <option value="warped" className="bg-zinc-900">Warped</option>
                  <option value="custom" className="bg-zinc-900">Custom...</option>
                </select>
                
                {restorationMode === 'custom' && (
                  <input 
                    type="text" 
                    value={customRestorationPrompt}
                    onChange={(e) => setCustomRestorationPrompt(e.target.value)}
                    placeholder="Enter prompt..." 
                    className="bg-transparent text-xs text-zinc-200 px-3 w-40 outline-none placeholder:text-zinc-600 focus:w-64 transition-all duration-300"
                    disabled={isDetecting || isRestoring || detections.length === 0}
                  />
                )}
                
                <button
                  onClick={handleRestore}
                  disabled={isDetecting || isRestoring || detections.length === 0 || (restorationMode === 'custom' && !customRestorationPrompt.trim())}
                  className="px-4 py-1.5 my-1 ml-1 glass rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current transition-all"
                >
                  Restore
                </button>
              </div>
              
              <div className="flex bg-black/40 border border-white/10 rounded-full pr-1 overflow-hidden transition-all focus-within:border-white/30">
                <select 
                  className="bg-transparent text-xs text-zinc-300 px-3 outline-none cursor-pointer appearance-none border-r border-white/10 custom-select"
                  value={colorizationMode}
                  onChange={(e) => setColorizationMode(e.target.value as 'default' | 'watercolor' | 'painting' | 'digital-graphic' | 'photo' | 'custom')}
                  disabled={isDetecting || isColorizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED]}
                >
                  <option value="default" className="bg-zinc-900">Default</option>
                  <option value="watercolor" className="bg-zinc-900">Watercolor</option>
                  <option value="painting" className="bg-zinc-900">Painting</option>
                  <option value="digital-graphic" className="bg-zinc-900">Digital Graphic</option>
                  <option value="photo" className="bg-zinc-900">Photo</option>
                  <option value="custom" className="bg-zinc-900">Custom...</option>
                </select>
                
                {colorizationMode === 'custom' && (
                  <input 
                    type="text" 
                    value={customColorizationPrompt}
                    onChange={(e) => setCustomColorizationPrompt(e.target.value)}
                    placeholder="Enter prompt..." 
                    className="bg-transparent text-xs text-zinc-200 px-3 w-40 outline-none placeholder:text-zinc-600 focus:w-64 transition-all duration-300"
                    disabled={isDetecting || isColorizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED]}
                  />
                )}
                
                <button
                  onClick={handleColorize}
                  disabled={isDetecting || isColorizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED] || (colorizationMode === 'custom' && !customColorizationPrompt.trim())}
                  className="px-4 py-1.5 my-1 ml-1 glass rounded-full text-xs font-bold hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current transition-all"
                >
                  Colorize
                </button>
              </div>

              <div className="flex bg-black/40 border border-white/10 rounded-full pr-1 overflow-hidden transition-all focus-within:border-white/30">
                <select 
                  className="bg-transparent text-xs text-zinc-300 px-3 outline-none cursor-pointer appearance-none border-r border-white/10 custom-select"
                  value={cinematizationMode}
                  onChange={(e) => setCinematizationMode(e.target.value as 'default' | 'custom')}
                  disabled={isDetecting || isCinematizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED]}
                >
                  <option value="default" className="bg-zinc-900">Default</option>
                  <option value="custom" className="bg-zinc-900">Custom...</option>
                </select>
                
                {cinematizationMode === 'custom' && (
                  <input 
                    type="text" 
                    value={customCinematizationPrompt}
                    onChange={(e) => setCustomCinematizationPrompt(e.target.value)}
                    placeholder="Enter prompt..." 
                    className="bg-transparent text-xs text-zinc-200 px-3 w-40 outline-none placeholder:text-zinc-600 focus:w-64 transition-all duration-300"
                    disabled={isDetecting || isCinematizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED]}
                  />
                )}
                
                <button
                  onClick={handleCinematize}
                  disabled={isDetecting || isCinematizing || !workflow?.imagesByStep?.[WorkflowStep.RESTORED] || (cinematizationMode === 'custom' && !customCinematizationPrompt.trim())}
                  className="px-4 py-1.5 my-1 ml-1 glass rounded-full text-xs font-bold hover:bg-amber-500 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current transition-all"
                >
                  Cinematize
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* View Switcher */}
            <div className="sticky top-0 z-40 flex justify-center pb-6 pt-2 -mt-2 pointer-events-none">
              <div className="glass p-1 rounded-full flex gap-1 shadow-[0_10px_50px_rgba(0,0,0,0.8)] pointer-events-auto">
                <button 
                  onClick={() => setActiveView('original')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeView === 'original' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Original Image
                </button>
                <button 
                  onClick={() => setActiveView('processed')}
                  disabled={!workflow}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeView === 'processed' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'} disabled:opacity-30`}
                >
                  Processed Results
                </button>
                <button 
                  onClick={() => setActiveView('table')}
                  disabled={!workflow || detections.length === 0}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeView === 'table' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'} disabled:opacity-30`}
                >
                  Data Table
                </button>
              </div>
            </div>

            {/* Main Stage / Table View */}
            {activeView === 'table' ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <DetectionDataTable objects={detections} />
              </div>
            ) : (
              <div className="relative group rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 bg-zinc-900 animate-in fade-in duration-700">
                <div className="absolute top-6 left-6 z-10">
                  <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeView === 'original' ? 'bg-zinc-400' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                      {activeView === 'original' ? 'Source View' : 'AI Render View'}
                    </span>
                  </div>
                </div>

                <div className="relative bg-black/40 min-h-[400px] flex items-center justify-center">
                  <img 
                    src={selectedSource} 
                    className={`w-full h-auto block transition-all duration-1000 ${activeView === 'processed' ? 'opacity-20 grayscale blur-sm scale-[0.98]' : 'opacity-100 scale-100 blur-0'}`} 
                    alt="Source"
                  />
                  
                  {/* Detections & Processed View Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {detections.map((obj, i) => {
                      const isProcessedView = activeView === 'processed';
                      const processedBase64 = workflow?.imagesByStep?.[WorkflowStep.CINEMATIZED]?.[i] || 
                                              workflow?.imagesByStep?.[WorkflowStep.COLORIZED]?.[i] || 
                                              workflow?.imagesByStep?.[WorkflowStep.RESTORED]?.[i];
                      
                      const left = `${((obj.box_2d[0] / (workflow?.sourceImage?.width || 1000)) * 100).toFixed(1)}%`;
                      const top = `${((obj.box_2d[1] / (workflow?.sourceImage?.height || 1000)) * 100).toFixed(1)}%`;
                      const width = `${(((obj.box_2d[2] - obj.box_2d[0]) / (workflow?.sourceImage?.width || 1000)) * 100).toFixed(1)}%`;
                      const height = `${(((obj.box_2d[3] - obj.box_2d[1]) / (workflow?.sourceImage?.height || 1000)) * 100).toFixed(1)}%`;

                      return (
                        <div
                          key={i}
                          className={`absolute border-2 rounded-lg transition-all duration-700 ease-out ${
                            isProcessedView && processedBase64 
                              ? 'border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 hover:z-20 hover:scale-110' 
                              : 'border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-slow-fade-in delay-[100ms]'
                          }`}
                          style={{ left, top, width, height }}
                        >
                          {isProcessedView && processedBase64 ? (
                            <div className="relative w-full h-full overflow-hidden rounded-lg pointer-events-auto cursor-zoom-in group/img"
                                 onClick={(e) => { e.stopPropagation(); setZoomedImage(processedBase64); }}>
                              <img 
                                src={`data:image/png;base64,${processedBase64}`}
                                className="w-full h-full object-fill animate-in fade-in zoom-in duration-500 group-hover/img:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{obj.label}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="absolute -top-6 left-0 glass px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-primary tracking-tighter shadow-xl transition-opacity animate-in fade-in">
                              {obj.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Processing Overlay */}
                  {(isRestoring || isColorizing || isCinematizing || isDetecting) && (
                    <div className="absolute inset-0 z-30 glass flex flex-col items-center justify-center animate-in fade-in duration-500">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl animate-pulse">✨</span>
                        </div>
                      </div>
                      <p className="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-zinc-400 animate-pulse">
                        Synthesizing Neural Layers...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Grid (Only if processed) */}
            {activeView === 'processed' && detections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
                {detections.map((obj, i) => (
                  <div key={i} className="glass-card rounded-[2rem] p-6 flex flex-col gap-6 group/item">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/5">
                       {/* Workflow Steps Preview */}
                       <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 transition-transform duration-500 group-hover/item:translate-x-1">
                          {workflow?.imagesByStep?.[WorkflowStep.RESTORED]?.[i] && (
                            <button 
                              onClick={() => setZoomedImage(workflow.imagesByStep[WorkflowStep.RESTORED][i])}
                              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-colors"
                              title="Restored"
                            >
                              ✨
                            </button>
                          )}
                          {workflow?.imagesByStep?.[WorkflowStep.COLORIZED]?.[i] && (
                            <button 
                              onClick={() => setZoomedImage(workflow.imagesByStep[WorkflowStep.COLORIZED][i])}
                              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors"
                              title="Colorized"
                            >
                              🎨
                            </button>
                          )}
                          {workflow?.imagesByStep?.[WorkflowStep.CINEMATIZED]?.[i] && (
                            <button 
                              onClick={() => setZoomedImage(workflow.imagesByStep[WorkflowStep.CINEMATIZED][i])}
                              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-amber-500 transition-colors"
                              title="Cinematic"
                            >
                              🎬
                            </button>
                          )}
                       </div>

                       {/* Display the most advanced version available */}
                       <img 
                          src={`data:image/png;base64,${
                            workflow?.imagesByStep?.[WorkflowStep.CINEMATIZED]?.[i] || 
                            workflow?.imagesByStep?.[WorkflowStep.COLORIZED]?.[i] || 
                            workflow?.imagesByStep?.[WorkflowStep.RESTORED]?.[i]
                          }`}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                       />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{obj.label}</span>
                        <div className="text-[10px] text-zinc-500 font-mono">ID: #{i.toString().padStart(3, '0')}</div>
                      </div>
                      <p className="text-zinc-300 text-sm italic font-medium leading-relaxed">&quot;{obj.caption?.replace(/\n/g, ' ')}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar: Metadata & Info */}
      <aside className="w-80 border-l border-white/5 glass z-10 h-full overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-8 space-y-8 flex-1">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-6">Object Metadata</h2>
            <div className="space-y-6">
               <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Primary Label</p>
                <p className="text-sm font-bold text-zinc-200">{metadata.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Provider / Credit</p>
                <p className="text-xs text-zinc-400 italic leading-relaxed">{metadata.creditLine}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <a 
                  href={metadata.webpageUrl} 
                  target="_blank" 
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:text-white transition-colors uppercase tracking-widest"
                >
                  Resource Repository <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-6">Technical Logs</h2>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 font-mono text-[10px] space-y-2">
                <div className="text-emerald-500 opacity-50 flex justify-between">
                  <span>SYSTEM_INIT</span>
                  <span>OK</span>
                </div>
                <div className="text-blue-500 opacity-50 flex justify-between">
                  <span>RESOLVE_ASSETS</span>
                  <span>100%</span>
                </div>
                {detections.length > 0 && (
                  <div className="text-primary flex justify-between animate-pulse">
                    <span>NEURAL_MAP_GEN</span>
                    <span>READY</span>
                  </div>
                )}
              </div>
               <p className="text-[10px] text-zinc-600 italic">
                Advanced AI modeling enabled for historical document restoration.
              </p>
            </div>
          </div>
        </div>
      </aside>


      {/* Zoom Modal */}
      <ImageModal 
        isOpen={!!zoomedImage} 
        onClose={() => setZoomedImage(null)} 
        imageSrc={zoomedImage} 
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ObjectDetectionTest;
