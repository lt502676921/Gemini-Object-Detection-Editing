"use client";

import React, { useState } from 'react';
import { DetectedObject } from '@/lib/genai/types';
import { getConsolidatedStats } from '@/lib/genai/utils';

interface Props {
  objects: DetectedObject[];
}

const DetectionDataTable: React.FC<Props> = ({ objects }) => {
  const [showConsolidated, setShowConsolidated] = useState(false);

  const formatCaption = (s: string) => {
    if (!s) return <span className="text-white/10 italic">None</span>;
    return `"${s.replace(/\n/g, "↩️")}"`;
  };

  const consolidatedStats: Record<string, string[]> = getConsolidatedStats(objects);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
          Detection Data
        </h3>
        <button
          onClick={() => setShowConsolidated(!showConsolidated)}
          className="px-4 py-2 glass rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          {showConsolidated ? 'Show All Objects' : 'Show Consolidated Stats'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 glass shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              {showConsolidated ? (
                <>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest">Label</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-center">Count</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest">Captions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest">Box (Normalized)</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest">Label</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest">Caption</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {showConsolidated ? (
              Object.entries(consolidatedStats).map(([label, captions]: [string, string[]]) => (
                <tr key={label} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-primary font-bold">{label}</td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-400">{captions.length}</td>
                  <td className="px-6 py-4 text-zinc-300 italic leading-relaxed">
                    {captions.map((c: string) => formatCaption(c)).join(' • ')}
                  </td>
                </tr>
              ))
            ) : (
              objects.map((obj, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-zinc-500 text-[10px]">
                    [{obj.box_2d.join(', ')}]
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold group-hover:bg-primary group-hover:text-white transition-all">
                      {obj.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 italic">
                    {formatCaption(obj.caption)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionDataTable;
