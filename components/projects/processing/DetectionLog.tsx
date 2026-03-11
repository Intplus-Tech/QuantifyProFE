"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import type { LogEntry, LogEntryType } from "./types";

interface DetectionLogProps {
  logs: LogEntry[];
}

const TYPE_CONFIG: Record<LogEntryType, { icon: typeof Info; color: string; dot: string }> = {
  success: { icon: CheckCircle, color: "text-emerald-500", dot: "bg-emerald-500" },
  info: { icon: Info, color: "text-blue-500", dot: "bg-blue-500" },
  warning: { icon: AlertTriangle, color: "text-amber-500", dot: "bg-amber-500" },
  error: { icon: AlertCircle, color: "text-red-500", dot: "bg-red-500" },
};

export function DetectionLog({ logs }: DetectionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Detection Log
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[340px]">
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Waiting for processing output…
          </div>
        )}

        {logs.map((log) => {
          const config = TYPE_CONFIG[log.type];
          const Icon = config.icon;
          return (
            <div
              key={log.id}
              className="flex items-start gap-2.5 py-2 px-2 rounded-lg hover:bg-muted/40 transition-colors animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className={`mt-0.5 shrink-0 ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{log.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">
                {log.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="px-4 py-2 border-t bg-muted/30">
        <span className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{logs.length}</span> events logged
        </span>
      </div>
    </div>
  );
}
