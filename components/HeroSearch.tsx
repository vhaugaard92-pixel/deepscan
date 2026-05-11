"use client";

import { useState } from "react";

interface HeroSearchProps {
  onScan: (name: string) => void;
  disabled?: boolean;
}

export default function HeroSearch({ onScan, disabled }: HeroSearchProps) {
  const [name, setName] = useState("");

  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && !disabled) onScan(name.trim());
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-5 h-5 border-2 border-amber-400 rotate-45 flex items-center justify-center flex-shrink-0">
          <div className="w-1 h-1 bg-amber-400" />
        </div>
        <span className="font-mono text-xs text-amber-400 tracking-[0.3em]">DEEPSCAN</span>
      </div>

      <h1 className="font-mono text-5xl font-bold text-white mb-3 leading-[1.1] tracking-tight">
        Intelligence on<br />
        <span className="text-amber-400">anyone.</span>
      </h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        Enter a name. Get a deep AI-researched briefing — origin story, wealth path,<br className="hidden sm:block" />
        psychology, content strategy, and more.
      </p>

      <form onSubmit={handle}>
        <div className="flex">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MrBeast, Sam Sulek, Alex Hormozi..."
            disabled={disabled}
            autoFocus
            className="flex-1 bg-[#111118] border border-[#2a2a3e] focus:border-amber-400/60 text-white font-mono text-sm px-5 py-4 outline-none transition-colors placeholder:text-gray-700 disabled:opacity-50 min-w-0"
          />
          <button
            type="submit"
            disabled={!name.trim() || disabled}
            className="bg-amber-400 hover:bg-amber-300 disabled:bg-[#1a1a2e] disabled:text-gray-600 text-black font-mono font-bold text-xs tracking-[0.15em] px-7 py-4 transition-colors disabled:cursor-not-allowed flex-shrink-0 border border-transparent disabled:border-[#2a2a3e]"
          >
            SCAN →
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-xs text-gray-700">
            14 web searches · 11-section report · streams live
          </span>
        </div>
      </form>
    </div>
  );
}
