"use client";

import type { ParsedSection } from "./ReportRenderer";

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

interface CompareLayoutProps {
  leftSections: ParsedSection[];
  rightSections: ParsedSection[];
  leftTarget: string;
  rightTarget: string;
  leftStreaming: boolean;
  rightStreaming: boolean;
  onCloseCompare: () => void;
}

interface SideProps {
  sections: ParsedSection[];
  target: string;
  streaming: boolean;
  accent: "white" | "amber";
}

function SectionList({ sections, streaming, accent }: { sections: ParsedSection[]; streaming: boolean; accent: "white" | "amber" }) {
  return (
    <div className="flex flex-col gap-3">
      {SECTION_ORDER.map((title) => {
        const section = sections.find((s) => s.title === title);
        const isPlaceholder = !section;
        const isActive = section?.isActive ?? false;
        return (
          <div
            key={title}
            className={`border transition-all duration-500 min-h-[120px] ${
              isActive
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
              {isActive && (
                <span className="font-mono text-xs text-amber-400 animate-pulse ml-auto">▌</span>
              )}
            </div>
            <div className="px-5 py-4">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                {section?.content || (streaming && isPlaceholder ? <span className="text-gray-700 font-mono text-xs">awaiting...</span> : null)}
                {isActive && (
                  <span className="inline-block w-2 h-4 bg-amber-400 ml-0.5 animate-pulse align-text-bottom" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Side({ sections, target, streaming, accent }: SideProps) {
  const headerClass =
    accent === "amber"
      ? "border-amber-400/50 bg-[#1a1408]"
      : "border-white/30 bg-[#111118]";
  const labelClass = accent === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className={`border ${headerClass} p-4 mb-3 sticky top-0 z-10`}>
        <div className="font-mono text-xs text-gray-500 tracking-widest mb-1">
          {accent === "amber" ? "COMPARE TARGET" : "PRIMARY TARGET"}
        </div>
        <div className={`font-mono text-xl font-bold ${labelClass} truncate`}>
          {target.toUpperCase()}
        </div>
        {streaming && (
          <div className="font-mono text-xs text-amber-400 animate-pulse mt-1">SCANNING...</div>
        )}
      </div>
      <SectionList sections={sections} streaming={streaming} accent={accent} />
    </div>
  );
}

export default function CompareLayout({
  leftSections,
  rightSections,
  leftTarget,
  rightTarget,
  leftStreaming,
  rightStreaming,
  onCloseCompare,
}: CompareLayoutProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-xs text-amber-400 tracking-widest">
          COMPARE MODE — SIDE BY SIDE
        </div>
        <button
          onClick={onCloseCompare}
          className="font-mono text-xs text-gray-500 hover:text-white border border-[#1e1e2e] hover:border-gray-500 px-3 py-1.5 transition-colors"
        >
          ✕ EXIT COMPARE
        </button>
      </div>
      <div className="flex gap-4">
        <Side
          sections={leftSections}
          target={leftTarget}
          streaming={leftStreaming}
          accent="white"
        />
        <div className="w-px bg-[#1e1e2e] flex-shrink-0" />
        <Side
          sections={rightSections}
          target={rightTarget}
          streaming={rightStreaming}
          accent="amber"
        />
      </div>
    </div>
  );
}
