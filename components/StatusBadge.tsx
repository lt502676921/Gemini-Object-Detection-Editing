'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const styles = {
    idle: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    processing: 'bg-primary/20 text-primary border-primary/30 animate-pulse',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status === 'processing' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 animate-bounce" />}
      {label}
    </div>
  );
};

export default StatusBadge;
