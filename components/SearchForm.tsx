"use client";

import { useState } from "react";

interface SearchFormProps {
  onScan: (name: string) => void;
  disabled?: boolean;
}

export default function SearchForm({ onScan, disabled }: SearchFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && !disabled) {
      onScan(name.trim());
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo / header */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-xs tracking-[0.4em] text-amber-400 uppercase">
            Intelligence System
          </span>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <h1 className="font-mono text-6xl font-bold tracking-tight text-white">
          DEEP<span className="text-amber-400">SCAN</span>
        </h1>
        <p className="font-mono text-xs text-gray-500 tracking-widest uppercase">
          Person Intelligence Report System v1.0
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-amber-400 text-sm select-none">
            TARGET:
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter any public figure..."
            disabled={disabled}
            className="w-full bg-[#111118] border border-[#1e1e2e] focus:border-amber-400 text-white font-mono text-sm pl-24 pr-4 py-4 outline-none transition-colors placeholder:text-gray-600 disabled:opacity-50"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || disabled}
          className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-[#1e1e2e] disabled:text-gray-600 text-black font-mono font-bold text-sm tracking-[0.2em] uppercase py-4 transition-colors disabled:cursor-not-allowed"
        >
          {disabled ? "SCANNING..." : "INITIATE SCAN"}
        </button>
      </form>

      {/* Disclaimer */}
      <p className="font-mono text-xs text-gray-600 text-center max-w-sm">
        CLASSIFIED — Searches public information only. For research and educational use.
      </p>
    </div>
  );
}
