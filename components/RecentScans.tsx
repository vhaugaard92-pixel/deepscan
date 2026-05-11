"use client";

import type { HistoryEntry } from "@/components/HistoryPanel";

interface RecentScansProps {
  entries: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function extractPreview(rawText: string): string {
  const match = rawText.match(/##\s*WHO ARE THEY\s*\n+([\s\S]{1,300})/i);
  if (match) {
    return match[1].replace(/##.*/, "").trim().slice(0, 130);
  }
  return rawText.replace(/##[^\n]*/g, "").trim().slice(0, 130);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RecentScans({ entries, onLoad, onDelete }: RecentScansProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-16">
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-xs text-gray-600 tracking-widest uppercase">
          Recent Scans
        </span>
        <div className="h-px flex-1 bg-[#1e1e2e]" />
        <span className="font-mono text-xs text-gray-700">{entries.length}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onLoad(entry)}
            className="group text-left bg-[#0d0d14] border border-[#1e1e2e] hover:border-amber-400/30 hover:bg-[#111118] transition-all duration-200 p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate pr-2">
                {entry.target}
              </span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
                className="text-gray-700 hover:text-red-400 text-xs flex-shrink-0 transition-colors leading-none pt-0.5"
              >
                ✕
              </span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3 text-left">
              {extractPreview(entry.rawText)}…
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-400/40" />
              <span className="font-mono text-xs text-gray-700">{formatDate(entry.date)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
