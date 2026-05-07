"use client";

import { useEffect, useRef } from "react";

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
};

interface ParsedSection {
  title: string;
  content: string;
  isActive: boolean;
}

interface ReportRendererProps {
  sections: ParsedSection[];
  target: string;
}

export default function ReportRenderer({ sections, target }: ReportRendererProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeSection = sections.find((s) => s.isActive);
    if (activeSection) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sections]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Report header */}
      <div className="border border-amber-400/30 bg-[#111118] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-xs text-amber-400 tracking-widest uppercase">
            DEEPSCAN INTELLIGENCE REPORT
          </div>
          <div className="font-mono text-xs text-gray-500">
            {new Date().toISOString().split("T")[0]}
          </div>
        </div>
        <div className="font-mono text-3xl text-white font-bold">{target.toUpperCase()}</div>
        <div className="font-mono text-xs text-gray-500 mt-2">
          CLASSIFICATION: OPEN SOURCE INTELLIGENCE — SYNTHETIC ANALYSIS
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {SECTION_ORDER.map((title) => {
          const section = sections.find((s) => s.title === title);
          if (!section) return null;

          return (
            <div
              key={title}
              className={`border transition-all duration-500 ${
                section.isActive
                  ? "border-amber-400/50 bg-[#111118]"
                  : "border-[#1e1e2e] bg-[#0d0d14]"
              }`}
            >
              {/* Section header */}
              <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e1e2e]">
                <span className="font-mono text-xs text-amber-400 font-bold">
                  [{SECTION_ICONS[title] || "??"}]
                </span>
                <span className="font-mono text-xs text-amber-400 tracking-widest uppercase font-bold">
                  {title}
                </span>
                {section.isActive && (
                  <span className="font-mono text-xs text-amber-400 animate-pulse ml-auto">
                    ▌
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
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

      <div ref={bottomRef} />
    </div>
  );
}

export function parseSections(rawText: string, isStreaming: boolean): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const regex = /^## (.+)$/m;
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
