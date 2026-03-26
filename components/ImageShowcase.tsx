'use client';

import React from 'react';
import { Source, metadataBySource } from '@/lib/constants/test-images';

const ImageShowcase: React.FC = () => {
  const sources = Object.values(Source);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-slow-fade-in">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-gradient">
          Image Gallery
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
          Explore our collection of historical and technical test images used for AI-powered restoration and analysis.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sources.map((src, index) => {
          const metadata = metadataBySource[src as Source];
          return (
            <div 
              key={src} 
              className="group relative flex flex-col glass-card rounded-3xl overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={src} 
                  alt={metadata.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                   <a 
                    href={metadata.webpageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass px-4 py-2 rounded-full text-xs font-medium hover:bg-white hover:text-black transition-all"
                  >
                    View Original Source
                  </a>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-zinc-100 line-clamp-1">{metadata.title}</h3>
                </div>
                <p className="text-zinc-500 text-sm italic mb-4 line-clamp-2">{metadata.creditLine}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Source Material</span>
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageShowcase;
