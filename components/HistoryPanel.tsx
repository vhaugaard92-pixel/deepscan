"use client";

import { useState } from "react";

export interface HistoryEntry {
  id: string;
  target: string;
  date: string;
  rawText: string;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function extractWhoAreThey(rawText: string): string {
  const match = rawText.match(/##\s*WHO ARE THEY\s*\n([\s\S]*?)(?:\n##|$)/);
  if (!match) return "";
  return match[1].trim().slice(0, 60);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().split("T")[0];
  } catch {
    return iso;
  }
}

export default function HistoryPanel({ entries, onLoad, onDelete }: HistoryPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#1e1e2e]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111118] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-amber-400 font-bold">HISTORY</span>
          {entries.length > 0 && (
            <span className="font-mono text-xs bg-amber-400 text-black px-1.5 py-0.5 font-bold">
              {entries.length}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {entries.length === 0 ? (
            <div className="font-mono text-xs text-gray-600 text-center py-2">
              No previous scans
            </div>
          ) : (
            entries.map((e) => {
              const summary = extractWhoAreThey(e.rawText);
              return (
                <div key={e.id} className="border border-[#1e1e2e] bg-[#0d0d14]">
                  <button
                    onClick={() => onLoad(e)}
                    className="w-full text-left px-3 py-2 hover:bg-[#111118] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-amber-400 font-bold truncate">
                        {e.target.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-gray-600 ml-2 flex-shrink-0">
                        {formatDate(e.date)}
                      </span>
                    </div>
                    {summary && (
                      <p className="text-gray-500 text-xs leading-snug font-sans line-clamp-2">
                        {summary}
                      </p>
                    )}
                  </button>
                  <div className="flex border-t border-[#1e1e2e]">
                    <button
                      onClick={() => onDelete(e.id)}
                      className="flex-1 py-1.5 font-mono text-xs text-gray-600 hover:text-red-400 hover:bg-[#111118] transition-colors"
                    >
                      ✕ DELETE
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
