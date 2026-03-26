'use client';

import React from 'react';
import SettingsModal from './SettingsModal';
import { useConfig } from './ConfigContext';

interface NavbarProps {
  activeTab: 'gallery' | 'detection';
  onTabChange: (tab: 'gallery' | 'detection') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { isSettingsOpen, setIsSettingsOpen } = useConfig();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 animate-slow-fade-in pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="glass px-2 py-2 rounded-full flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => onTabChange('gallery')}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-all duration-300 ${
                activeTab === 'gallery'
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => onTabChange('detection')}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-all duration-300 ${
                activeTab === 'detection'
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Workspace
            </button>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 text-zinc-400 hover:text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
            title="Configure API & Model"
          >
            <svg 
              viewBox="0 0 24 24" 
              width="20" 
              height="20" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:rotate-90 transition-transform duration-500"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;
