"use client";

import { useState, useCallback, useEffect } from "react";
import AppSidebar from "@/components/AppSidebar";
import HeroSearch from "@/components/HeroSearch";
import RecentScans from "@/components/RecentScans";
import ScanningOverlay from "@/components/ScanningOverlay";
import ReportRenderer, { parseSections } from "@/components/ReportRenderer";
import SavedPanel from "@/components/SavedPanel";
import PromptModal from "@/components/PromptModal";
import HistoryPanel, { type HistoryEntry } from "@/components/HistoryPanel";
import ChatPanel from "@/components/ChatPanel";
import CompareLayout from "@/components/CompareLayout";
import type { SavedSnippet } from "@/components/ReportRenderer";

type AppState = "idle" | "scanning" | "report";

interface ScanEvent {
  type: "queries" | "search_start" | "text" | "done" | "error";
  queries?: string[];
  query?: string;
  text?: string;
  message?: string;
}

interface PromptState {
  text: string;
  section: string;
}

const HISTORY_KEY = "deepscan_history";
const HISTORY_MAX = 10;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)));
  } catch {
    // ignore quota
  }
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [target, setTarget] = useState("");
  const [queries, setQueries] = useState<string[]>([]);
  const [completedQueries, setCompletedQueries] = useState<string[]>([]);
  const [activeQuery, setActiveQuery] = useState<string | undefined>();
  const [rawText, setRawText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([]);
  const [promptModal, setPromptModal] = useState<PromptState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [showCompareForm, setShowCompareForm] = useState(false);
  const [compareTarget, setCompareTarget] = useState("");
  const [compareRawText, setCompareRawText] = useState("");
  const [compareIsScanning, setCompareIsScanning] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleScan = useCallback(async (name: string) => {
    setTarget(name);
    setState("scanning");
    setQueries([]);
    setCompletedQueries([]);
    setActiveQuery(undefined);
    setRawText("");
    setIsStreaming(false);
    setError(null);
    setCompareMode(false);
    setCompareTarget("");
    setCompareRawText("");

    let finalRawText = "";

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok || !res.body) throw new Error("Scan failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let searchCallCount = 0;
      let queryLabels: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let event: ScanEvent;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === "queries" && event.queries) {
            queryLabels = event.queries;
            setQueries(event.queries);
          }

          if (event.type === "search_start" && event.query) {
            setActiveQuery(event.query);
            if (searchCallCount > 0 && queryLabels[searchCallCount - 1]) {
              const prevLabel = queryLabels[searchCallCount - 1];
              setCompletedQueries((prev) =>
                prev.includes(prevLabel) ? prev : [...prev, prevLabel]
              );
            }
            searchCallCount++;
          }

          if (event.type === "text" && event.text) {
            setIsStreaming(true);
            setState("report");
            finalRawText += event.text;
            setRawText((prev) => prev + event.text);
          }

          if (event.type === "done") {
            setIsStreaming(false);
            setActiveQuery(undefined);
            setCompletedQueries(queryLabels);
            setState("report");

            if (finalRawText.trim()) {
              const entry: HistoryEntry = {
                id: crypto.randomUUID(),
                target: name,
                date: new Date().toISOString(),
                rawText: finalRawText,
              };
              setHistory((prev) => {
                const next = [entry, ...prev].slice(0, HISTORY_MAX);
                saveHistory(next);
                return next;
              });
            }
          }

          if (event.type === "error") {
            setError(event.message || "Unknown error");
            setState("idle");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan");
      setState("idle");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const handleCompareScan = useCallback(async (name: string) => {
    setCompareTarget(name);
    setCompareRawText("");
    setCompareIsScanning(true);
    setCompareMode(true);
    setShowCompareForm(false);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok || !res.body) throw new Error("Compare scan failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let event: ScanEvent;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === "text" && event.text) {
            setCompareRawText((prev) => prev + event.text);
          }
          if (event.type === "done") setCompareIsScanning(false);
          if (event.type === "error") {
            setError(event.message || "Compare scan error");
            setCompareIsScanning(false);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed compare scan");
      setCompareIsScanning(false);
    } finally {
      setCompareIsScanning(false);
    }
  }, []);

  function handleSaveSnippet(snippet: Omit<SavedSnippet, "id">) {
    setSavedSnippets((prev) => [{ ...snippet, id: crypto.randomUUID() }, ...prev]);
  }

  function handleDeleteSnippet(id: string) {
    setSavedSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  function handleGeneratePrompt(text: string, section: string) {
    setPromptModal({ text, section });
  }

  function loadFromHistory(entry: HistoryEntry) {
    setRawText(entry.rawText);
    setTarget(entry.target);
    setIsStreaming(false);
    setQueries([]);
    setCompletedQueries([]);
    setActiveQuery(undefined);
    setCompareMode(false);
    setCompareRawText("");
    setCompareTarget("");
    setState("report");
  }

  function handleDeleteHistory(id: string) {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }

  function handleGoHome() {
    setState("idle");
    setCompareMode(false);
  }

  const sections = parseSections(rawText, isStreaming);
  const compareSections = parseSections(compareRawText, compareIsScanning);
  const isReport = state === "report";

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Icon sidebar — always visible */}
      <AppSidebar
        view={isReport ? "report" : "home"}
        onHome={handleGoHome}
        onCompare={() => setShowCompareForm(true)}
        showCompare={isReport && !compareMode && !isStreaming}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ── IDLE ── */}
        {state === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <HeroSearch onScan={handleScan} />
            <RecentScans
              entries={history}
              onLoad={loadFromHistory}
              onDelete={handleDeleteHistory}
            />
          </div>
        )}

        {/* ── SCANNING ── */}
        {state === "scanning" && (
          <div className="flex-1 flex items-center justify-center px-8 py-16">
            <ScanningOverlay
              target={target}
              queries={queries}
              completedQueries={completedQueries}
              activeQuery={activeQuery}
            />
          </div>
        )}

        {/* ── REPORT ── */}
        {state === "report" && (
          <div className="flex flex-1 min-h-0">
            {/* Report sidebar — info, queries, history, saved */}
            <div className="w-56 flex-shrink-0 border-r border-[#1e1e2e] flex flex-col bg-[#0a0a0f]">
              {/* Target name */}
              <div className="px-4 py-4 border-b border-[#1e1e2e]">
                <div className="font-mono text-xs text-gray-600 tracking-widest mb-1">TARGET</div>
                <div className="font-mono text-sm font-bold text-amber-400 truncate">
                  {target.toUpperCase()}
                </div>
                {isStreaming && (
                  <div className="font-mono text-xs text-amber-400 animate-pulse mt-1">SCANNING...</div>
                )}
              </div>

              {/* Queries */}
              {queries.length > 0 && (
                <div className="px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0">
                  <div className="font-mono text-xs text-gray-700 tracking-widest mb-2">
                    SEARCHES {completedQueries.length}/{queries.length}
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-48">
                    {queries.map((q) => (
                      <div key={q} className="flex items-center gap-2">
                        <span className={`font-mono text-xs flex-shrink-0 ${completedQueries.includes(q) ? "text-amber-400" : "text-gray-700"}`}>
                          {completedQueries.includes(q) ? "✓" : "○"}
                        </span>
                        <span className={`font-mono text-xs truncate ${completedQueries.includes(q) ? "text-gray-500" : "text-gray-700"}`}>
                          {q}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <HistoryPanel
                entries={history}
                onLoad={loadFromHistory}
                onDelete={handleDeleteHistory}
              />

              {/* Saved panel */}
              <SavedPanel
                snippets={savedSnippets}
                onDelete={handleDeleteSnippet}
                onGeneratePrompt={handleGeneratePrompt}
                target={target}
                fullReport={rawText}
              />
            </div>

            {/* Report area */}
            <div className="flex-1 overflow-y-auto p-6 min-w-0">
              {compareMode ? (
                <CompareLayout
                  leftSections={sections}
                  rightSections={compareSections}
                  leftTarget={target}
                  rightTarget={compareTarget}
                  leftStreaming={isStreaming}
                  rightStreaming={compareIsScanning}
                  onCloseCompare={() => {
                    setCompareMode(false);
                    setCompareTarget("");
                    setCompareRawText("");
                  }}
                />
              ) : (
                <>
                  <ReportRenderer
                    sections={sections}
                    target={target}
                    onSave={handleSaveSnippet}
                    onGeneratePrompt={handleGeneratePrompt}
                  />
                  {!isStreaming && rawText && (
                    <ChatPanel target={target} rawText={rawText} />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compare form modal */}
      {showCompareForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCompareForm(false)}
          />
          <div className="relative w-full max-w-lg bg-[#111118] border border-amber-400/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-xs text-amber-400 tracking-widest font-bold">
                ⇄ COMPARE WITH ANOTHER TARGET
              </div>
              <button
                onClick={() => setShowCompareForm(false)}
                className="font-mono text-xs text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="font-mono text-xs text-gray-500 mb-4">
              Comparing against: <span className="text-white">{target.toUpperCase()}</span>
            </div>
            <CompareForm onSubmit={handleCompareScan} />
          </div>
        </div>
      )}

      {/* Prompt modal */}
      {promptModal && (
        <PromptModal
          text={promptModal.text}
          section={promptModal.section}
          target={target}
          onClose={() => setPromptModal(null)}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500 text-red-200 font-mono text-xs p-4 max-w-sm z-50">
          ERROR: {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function CompareForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  }
  return (
    <form onSubmit={handle} className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter compare target..."
        className="w-full bg-[#0a0a0f] border border-[#1e1e2e] focus:border-amber-400 text-white font-mono text-sm px-4 py-3 outline-none transition-colors placeholder:text-gray-600"
        autoFocus
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-[#1e1e2e] disabled:text-gray-600 text-black font-mono font-bold text-xs tracking-[0.2em] uppercase py-3 transition-colors disabled:cursor-not-allowed"
      >
        START COMPARE SCAN
      </button>
    </form>
  );
}
