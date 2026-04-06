"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "./types";

interface DetectionLogProps {
  logs: LogEntry[];
}

export function DetectionLog({ logs }: DetectionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="border rounded-2xl bg-white dark:bg-slate-900 text-card-foreground shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Detection Log
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-100 dark:border-orange-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          Live
        </span>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground gap-2 opacity-60">
            <Clock className="w-8 h-8 opacity-20" />
            Waiting for processing output…
          </div>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className={`mt-1 shrink-0 ${
              log.type === 'success' ? 'text-emerald-500' : 
              log.type === 'error' ? 'text-rose-500' : 
              'text-amber-500'
            }`}>
              {log.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              ) : log.type === 'error' ? (
                <XCircle className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                {log.timestamp}
              </span>
              <p className={`text-[12px] font-medium leading-normal ${
                log.type === 'success' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer summary */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Estimated Time:
          </span>
          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
            1m 45s
          </span>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-center h-10 rounded-xl bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all"
        >
          <XCircle className="w-3.5 h-3.5 mr-2" />
          Cancel Analysis
        </Button>
      </div>
    </div>
  );
}
