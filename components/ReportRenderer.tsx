"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SECTION_ORDER = [
  "WHO ARE THEY",
  "THE FULL ORIGIN STORY",
  "WEALTH PATH — STEP BY STEP",
  "CONTENT & PLATFORM STRATEGY",
  "KEY PEOPLE & CONNECTIONS",
  "PSYCHOLOGICAL PROFILE",
  "AUDIENCE PSYCHOLOGY",
  "PATTERNS & FORMULAS",
  "CONTROVERSIES & REAL TALK",
  "YOUR ACTION PLAN",
  "WHAT NOT TO COPY",
];

const SECTION_ICONS: Record<string, string> = {
  "WHO ARE THEY": "ID",
  "THE FULL ORIGIN STORY": "01",
  "WEALTH PATH — STEP BY STEP": "02",
  "CONTENT & PLATFORM STRATEGY": "03",
  "KEY PEOPLE & CONNECTIONS": "04",
  "PSYCHOLOGICAL PROFILE": "05",
  "AUDIENCE PSYCHOLOGY": "06",
  "PATTERNS & FORMULAS": "07",
  "CONTROVERSIES & REAL TALK": "08",
  "YOUR ACTION PLAN": "09",
  "WHAT NOT TO COPY": "⚠",
};

// Sections where we want concise output
const BRIEF_SECTIONS = new Set([
  "WHO ARE THEY",
  "KEY PEOPLE & CONNECTIONS",
  "CONTROVERSIES & REAL TALK",
]);

export interface ParsedSection {
  title: string;
  content: string;
  isActive: boolean;
}

export interface SavedSnippet {
  id: string;
  text: string;
  section: string;
  target: string;
}

interface SelectionToolbar {
  x: number;
  y: number;
  text: string;
  section: string;
}

interface ReportRendererProps {
  sections: ParsedSection[];
  target: string;
  onSave: (snippet: Omit<SavedSnippet, "id">) => void;
  onGeneratePrompt: (text: string, section: string) => void;
}

export default function ReportRenderer({
  sections,
  target,
  onSave,
  onGeneratePrompt,
}: ReportRendererProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<SelectionToolbar | null>(null);
  const activeSection = useRef<string>("");

  // Smart scroll: only follow if user is near bottom
  useEffect(() => {
    const active = sections.find((s) => s.isActive);
    if (!active) return;
    activeSection.current = active.title;

    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distFromBottom < 200) {
      container.scrollTop = container.scrollHeight;
    }
  }, [sections]);

  // Text selection → floating toolbar
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 15) {
      setToolbar(null);
      return;
    }

    // Find which section the selection is in
    let sectionTitle = "";
    let node: Node | null = sel?.anchorNode ?? null;
    while (node && node !== e.currentTarget) {
      const el = node as HTMLElement;
      if (el.dataset?.section) {
        sectionTitle = el.dataset.section;
        break;
      }
      node = node.parentNode;
    }

    const range = sel?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();
    if (!rect) return;

    const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setToolbar({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 48,
      text,
      section: sectionTitle,
    });
  }, []);

  function handleSaveSnippet() {
    if (!toolbar) return;
    onSave({ text: toolbar.text, section: toolbar.section, target });
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  }

  function handleGeneratePrompt() {
    if (!toolbar) return;
    onGeneratePrompt(toolbar.text, toolbar.section);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div
      ref={scrollContainerRef}
      className="w-full max-w-4xl mx-auto relative"
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-toolbar]")) {
          const sel = window.getSelection();
          if (!sel?.toString().trim()) setToolbar(null);
        }
      }}
    >
      {/* Floating selection toolbar */}
      {toolbar && (
        <div
          data-toolbar
          className="absolute z-50 flex items-center gap-1 bg-[#1a1a2e] border border-amber-400/40 p-1"
          style={{ left: toolbar.x, top: toolbar.y, transform: "translateX(-50%)" }}
        >
          <button
            onClick={handleSaveSnippet}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            ⊕ SAVE
          </button>
          <div className="w-px h-5 bg-[#1e1e2e]" />
          <button
            onClick={handleGeneratePrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-white hover:bg-amber-400/10 transition-colors"
          >
            ✦ PROMPT
          </button>
          {/* Triangle pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(245,158,11,0.4)",
            }}
          />
        </div>
      )}

      {/* Report header */}
      <div className="border border-amber-400/30 bg-[#111118] p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-xs text-amber-400 tracking-widest">
            DEEPSCAN INTELLIGENCE REPORT
          </div>
          <div className="font-mono text-xs text-gray-500">
            {new Date().toISOString().split("T")[0]}
          </div>
        </div>
        <div className="font-mono text-2xl text-white font-bold">{target.toUpperCase()}</div>
        <div className="font-mono text-xs text-gray-600 mt-1">
          OPEN SOURCE INTELLIGENCE — SYNTHETIC ANALYSIS
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {SECTION_ORDER.map((title) => {
          const section = sections.find((s) => s.title === title);
          if (!section) return null;
          const isBrief = BRIEF_SECTIONS.has(title);

          return (
            <div
              key={title}
              className={`border transition-all duration-500 ${
                section.isActive
                  ? "border-amber-400/50 bg-[#111118]"
                  : "border-[#1e1e2e] bg-[#0d0d14]"
              }`}
            >
              <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#1e1e2e]">
                <span className="font-mono text-xs text-amber-400 font-bold w-6">
                  {SECTION_ICONS[title]}
                </span>
                <span className="font-mono text-xs text-amber-400 tracking-widest uppercase font-bold">
                  {title}
                </span>
                {isBrief && (
                  <span className="font-mono text-xs text-gray-600 ml-1">· BRIEF</span>
                )}
                {section.isActive && (
                  <span className="font-mono text-xs text-amber-400 animate-pulse ml-auto">▌</span>
                )}
              </div>

              <div className={`px-5 ${isBrief ? "py-3" : "py-4"}`} data-section={title}>
                <div
                  className={`text-gray-300 leading-relaxed whitespace-pre-wrap font-sans select-text ${
                    isBrief ? "text-sm" : "text-sm"
                  }`}
                >
                  {section.content}
                  {section.isActive && (
                    <span className="inline-block w-2 h-4 bg-amber-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function parseSections(rawText: string, isStreaming: boolean): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const parts = rawText.split(/^## /m);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIdx = part.indexOf("\n");
    const title = newlineIdx === -1 ? part.trim() : part.slice(0, newlineIdx).trim();
    const content = newlineIdx === -1 ? "" : part.slice(newlineIdx + 1).trim();

    sections.push({
      title,
      content,
      isActive: isStreaming && i === parts.length - 1,
    });
  }

  return sections;
}
