"use client";

import { useState, useCallback } from "react";
import SearchForm from "@/components/SearchForm";
import ScanningOverlay from "@/components/ScanningOverlay";
import ReportRenderer, { parseSections } from "@/components/ReportRenderer";
import SavedPanel from "@/components/SavedPanel";
import PromptModal from "@/components/PromptModal";
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

  const handleScan = useCallback(async (name: string) => {
    setTarget(name);
    setState("scanning");
    setQueries([]);
    setCompletedQueries([]);
    setActiveQuery(undefined);
    setRawText("");
    setIsStreaming(false);
    setError(null);

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
            setRawText((prev) => prev + event.text);
          }

          if (event.type === "done") {
            setIsStreaming(false);
            setActiveQuery(undefined);
            setCompletedQueries(queryLabels);
            setState("report");
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

  function handleSaveSnippet(snippet: Omit<SavedSnippet, "id">) {
    setSavedSnippets((prev) => [
      { ...snippet, id: crypto.randomUUID() },
      ...prev,
    ]);
  }

  function handleDeleteSnippet(id: string) {
    setSavedSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  function handleGeneratePrompt(text: string, section: string) {
    setPromptModal({ text, section });
  }

  const sections = parseSections(rawText, isStreaming);

  return (
    <main className="min-h-screen flex flex-col font-[var(--font-inter)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e2e]">
        <div className="font-[var(--font-mono)] text-xs text-amber-400 tracking-widest">
          DEEPSCAN v1.0
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-[var(--font-mono)] text-xs text-gray-500">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {state === "idle" && (
          <div className="flex-1 flex items-center justify-center px-6 py-20">
            <SearchForm onScan={handleScan} />
          </div>
        )}

        {state === "scanning" && (
          <div className="flex-1 flex items-center justify-center px-6 py-20">
            <ScanningOverlay
              target={target}
              queries={queries}
              completedQueries={completedQueries}
              activeQuery={activeQuery}
            />
          </div>
        )}

        {state === "report" && (
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#1e1e2e] bg-[#0a0a0f] flex flex-col">
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-5">
                  <SearchForm onScan={handleScan} disabled={isStreaming} />
                </div>
                {queries.length > 0 && (
                  <div>
                    <div className="font-[var(--font-mono)] text-xs text-gray-600 tracking-widest mb-2">
                      SEARCHES ({completedQueries.length}/{queries.length})
                    </div>
                    <div className="flex flex-col gap-1">
                      {queries.map((q) => (
                        <div key={q} className="flex items-center gap-2">
                          <span className={`font-[var(--font-mono)] text-xs flex-shrink-0 ${completedQueries.includes(q) ? "text-amber-400" : "text-gray-700"}`}>
                            {completedQueries.includes(q) ? "✓" : "○"}
                          </span>
                          <span className={`font-[var(--font-mono)] text-xs truncate ${completedQueries.includes(q) ? "text-gray-400" : "text-gray-700"}`}>
                            {q}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Saved panel pinned to bottom of sidebar */}
              <SavedPanel
                snippets={savedSnippets}
                onDelete={handleDeleteSnippet}
                onGeneratePrompt={handleGeneratePrompt}
                target={target}
                fullReport={rawText}
              />
            </div>

            {/* Report — scrolls independently */}
            <div className="flex-1 overflow-y-auto p-6">
              <ReportRenderer
                sections={sections}
                target={target}
                onSave={handleSaveSnippet}
                onGeneratePrompt={handleGeneratePrompt}
              />
            </div>
          </div>
        )}
      </div>

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
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500 text-red-200 font-[var(--font-mono)] text-xs p-4 max-w-sm">
          ERROR: {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
