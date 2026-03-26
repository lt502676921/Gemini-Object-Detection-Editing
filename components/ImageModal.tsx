'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  altText?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, altText = "Image Preview" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc || !mounted) return null;

  // Check if imageSrc is base64 or a regular URL
  const src = imageSrc.startsWith('data:') ? imageSrc : `data:image/png;base64,${imageSrc}`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/95 p-4 cursor-zoom-out animate-in fade-in duration-300 backdrop-blur-md overflow-hidden"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-7xl max-h-screen flex flex-col items-center justify-center">
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 z-10 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all shadow-xl hover:scale-110 active:scale-95 border border-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <img 
          src={src} 
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-default pointer-events-auto" 
          alt={altText} 
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Info Tag */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              High Fidelity Neural Render
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;
