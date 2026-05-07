"use client";

interface ScanningOverlayProps {
  target: string;
  queries: string[];
  completedQueries: string[];
  activeQuery?: string;
}

export default function ScanningOverlay({
  target,
  queries,
  completedQueries,
  activeQuery,
}: ScanningOverlayProps) {
  const progress = queries.length > 0 ? (completedQueries.length / queries.length) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-amber-400 tracking-widest uppercase mb-1">
            SCANNING TARGET
          </div>
          <div className="font-mono text-2xl text-white font-bold">{target.toUpperCase()}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="font-mono text-xs text-gray-500 tracking-widest">
            {completedQueries.length}/{queries.length} QUERIES
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs text-amber-400">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-[#1e1e2e] relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Active query */}
      {activeQuery && (
        <div className="bg-[#111118] border border-amber-400/30 p-3">
          <div className="font-mono text-xs text-amber-400 mb-1 tracking-widest">
            EXECUTING SEARCH:
          </div>
          <div className="font-mono text-sm text-white flex items-center gap-2">
            <span className="text-amber-400 animate-pulse">▶</span>
            {activeQuery}
          </div>
        </div>
      )}

      {/* Query list */}
      <div className="flex flex-col gap-1">
        {queries.map((label) => {
          const isDone = completedQueries.includes(label);
          const isActive = !isDone && activeQuery && completedQueries.length < queries.indexOf(label) + 1;

          return (
            <div
              key={label}
              className={`flex items-center gap-3 py-2 px-3 border transition-all duration-300 ${
                isDone
                  ? "border-amber-400/20 bg-amber-400/5"
                  : "border-[#1e1e2e] bg-transparent"
              }`}
            >
              <div className="w-5 flex-shrink-0">
                {isDone ? (
                  <span className="font-mono text-xs text-amber-400">✓</span>
                ) : isActive ? (
                  <span className="font-mono text-xs text-amber-400 animate-pulse">●</span>
                ) : (
                  <span className="font-mono text-xs text-gray-600">○</span>
                )}
              </div>
              <span
                className={`font-mono text-xs tracking-widest uppercase ${
                  isDone ? "text-amber-400" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom status */}
      <div className="font-mono text-xs text-gray-600 text-center animate-pulse">
        COMPILING INTELLIGENCE REPORT — DO NOT INTERRUPT
      </div>
    </div>
  );
}
