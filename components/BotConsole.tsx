
import React, { useEffect, useRef } from 'react';
import { BotLog } from '../types';

interface BotConsoleProps {
  logs: BotLog[];
}

const BotConsole: React.FC<BotConsoleProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeStyle = (type: BotLog['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400';
      case 'warning': return 'text-amber-400';
      case 'ai': return 'text-cyan-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-64 flex flex-col font-mono text-sm">
      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400 font-bold tracking-tight">AI CORE SYSTEM LOGS</span>
        </div>
        <span className="text-xs text-slate-500">24/7 ACTIVE SCAN</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Initializing systems... awaiting live data...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600 shrink-0">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
            <span className={getTypeStyle(log.type)}>
              {log.type === 'ai' && <i className="fas fa-brain mr-2 text-[10px]"></i>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotConsole;
