"use client";

import { Crosshair, Clock, GitCompare, ArrowLeft } from "lucide-react";

interface AppSidebarProps {
  view: "home" | "report";
  onHome: () => void;
  onCompare?: () => void;
  showCompare?: boolean;
}

const NAV = [
  { icon: Crosshair, label: "Scan", key: "scan" },
  { icon: Clock, label: "History", key: "history" },
];

export default function AppSidebar({ view, onHome, onCompare, showCompare }: AppSidebarProps) {
  return (
    <aside className="w-14 flex-shrink-0 border-r border-[#1e1e2e] bg-[#0a0a0f] flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="w-8 h-8 mb-4 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400 rotate-45 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-amber-400" />
        </div>
      </div>

      {view === "report" && (
        <button
          onClick={onHome}
          aria-label="Back to home"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-amber-400 hover:bg-[#111118] transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {view === "home" && NAV.map(({ icon: Icon, label, key }) => (
        <button
          key={key}
          aria-label={label}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-amber-400 hover:bg-[#111118] transition-colors cursor-pointer"
        >
          <Icon size={18} />
        </button>
      ))}

      {showCompare && onCompare && (
        <button
          onClick={onCompare}
          aria-label="Compare"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-amber-400 hover:bg-[#111118] transition-colors cursor-pointer"
        >
          <GitCompare size={18} />
        </button>
      )}

      {/* Bottom dot indicator */}
      <div className="mt-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
    </aside>
  );
}
