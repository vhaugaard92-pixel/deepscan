"use client";

import { useState } from "react";
import type { SavedSnippet } from "./ReportRenderer";

interface SavedPanelProps {
  snippets: SavedSnippet[];
  onDelete: (id: string) => void;
  onGeneratePrompt: (text: string, section: string) => void;
  target: string;
  fullReport: string;
}

export default function SavedPanel({
  snippets,
  onDelete,
  onGeneratePrompt,
  target,
  fullReport,
}: SavedPanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSaveReport() {
    const blob = new Blob([fullReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deepscan-${target.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopySnippet(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border-t border-[#1e1e2e]">
      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111118] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-amber-400 font-bold">SAVED</span>
          {snippets.length > 0 && (
            <span className="font-mono text-xs bg-amber-400 text-black px-1.5 py-0.5 font-bold">
              {snippets.length}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Save full report */}
          {fullReport && (
            <button
              onClick={handleSaveReport}
              className="w-full py-2 font-mono text-xs text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors tracking-widest"
            >
              ↓ SAVE FULL REPORT (.md)
            </button>
          )}

          {/* Snippets */}
          {snippets.length === 0 ? (
            <div className="font-mono text-xs text-gray-600 text-center py-2">
              Select text → save snippet
            </div>
          ) : (
            snippets.map((s) => (
              <div key={s.id} className="border border-[#1e1e2e] bg-[#0d0d14]">
                {s.section && (
                  <div className="px-3 py-1.5 border-b border-[#1e1e2e]">
                    <span className="font-mono text-xs text-amber-400/60">{s.section}</span>
                  </div>
                )}
                <div className="px-3 py-2">
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 font-sans">
                    {s.text}
                  </p>
                </div>
                <div className="flex border-t border-[#1e1e2e]">
                  <button
                    onClick={() => handleCopySnippet(s.text)}
                    className="flex-1 py-1.5 font-mono text-xs text-gray-500 hover:text-white hover:bg-[#111118] transition-colors"
                  >
                    {copied ? "✓" : "COPY"}
                  </button>
                  <div className="w-px bg-[#1e1e2e]" />
                  <button
                    onClick={() => onGeneratePrompt(s.text, s.section)}
                    className="flex-1 py-1.5 font-mono text-xs text-gray-500 hover:text-amber-400 hover:bg-[#111118] transition-colors"
                  >
                    PROMPT
                  </button>
                  <div className="w-px bg-[#1e1e2e]" />
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1.5 font-mono text-xs text-gray-600 hover:text-red-400 hover:bg-[#111118] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
