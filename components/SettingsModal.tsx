'use client';

import React, { useState } from 'react';
import { useConfig } from './ConfigContext';
import { MultimodalModel, ImageModel } from '@/lib/genai/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, selectedModel, setSelectedModel, selectedImageModel, setSelectedImageModel } = useConfig();
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localApiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gradient">AI Configuration</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-primary/5 to-blue-500/5" />
            </div>
            <p className="text-[10px] text-zinc-500 ml-1 italic">
              Key is stored in memory and lost on refresh.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Detection Model (Multimodal)
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as MultimodalModel)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all pr-10"
                >
                  {Object.entries(MultimodalModel).filter(([k]) => k !== 'DEFAULT').map(([key, value]) => (
                    <option key={key} value={value} className="bg-zinc-900">
                      {value}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Editing Model (Image Semantic)
              </label>
              <div className="relative">
                <select
                  value={selectedImageModel}
                  onChange={(e) => setSelectedImageModel(e.target.value as ImageModel)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all pr-10"
                >
                  {Object.entries(ImageModel).filter(([k]) => k !== 'DEFAULT').map(([key, value]) => {
                    let label: string = value;
                    if (value === ImageModel.GEMINI_2_5_FLASH_IMAGE) label = `Nano Banana 🍌 (${value})`;
                    if (value === ImageModel.GEMINI_3_PRO_IMAGE_PREVIEW) label = `Nano Banana Pro 🍌 (${value})`;
                    if (value === ImageModel.GEMINI_3_1_FLASH_IMAGE_PREVIEW) label = `Nano Banana 2 🍌 (${value})`;
                    
                    return (
                      <option key={key} value={value} className="bg-zinc-900">
                        {label}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
