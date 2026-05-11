"use client";

import { useState } from "react";

interface PromptModalProps {
  text: string;
  section: string;
  target: string;
  onClose: () => void;
}

function buildPrompt(text: string, section: string, target: string): string {
  const sectionLabel = section || "intelligence report";
  return `You are helping me apply specific insights from a research report on ${target}.

Here is the relevant intelligence from the "${sectionLabel}" section:

---
${text}
---

Based ONLY on what this person specifically did (not generic advice), help me:
1. Understand the core mechanism behind this — WHY it worked for them
2. Identify which part of this is replicable vs. unique to their situation
3. Give me 3 concrete steps I can take THIS WEEK to apply this exact approach

Be specific. No filler. Reference the actual details from the text above.`;
}

export default function PromptModal({ text, section, target, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const prompt = buildPrompt(text, section, target);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#111118] border border-amber-400/30 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-amber-400 font-bold">✦ GENERATED PROMPT</span>
            {section && (
              <span className="font-mono text-xs text-gray-500">— {section}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-gray-500 hover:text-white transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Source text */}
        <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0d0d14]">
          <div className="font-mono text-xs text-gray-500 mb-1 tracking-widest">SOURCE</div>
          <div className="text-gray-400 text-xs leading-relaxed line-clamp-3 font-sans">
            &ldquo;{text}&rdquo;
          </div>
        </div>

        {/* Generated prompt */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="font-mono text-xs text-gray-500 mb-2 tracking-widest">PROMPT</div>
          <pre className="text-gray-200 text-xs leading-relaxed font-sans whitespace-pre-wrap">
            {prompt}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-3 border-t border-[#1e1e2e]">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 font-mono text-xs font-bold tracking-widest transition-colors ${
              copied
                ? "bg-green-900/50 border border-green-500/30 text-green-400"
                : "bg-amber-400 hover:bg-amber-300 text-black"
            }`}
          >
            {copied ? "✓ COPIED" : "COPY PROMPT"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-mono text-xs text-gray-500 border border-[#1e1e2e] hover:text-white hover:border-gray-500 transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
