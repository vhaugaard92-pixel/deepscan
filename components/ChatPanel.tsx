"use client";

import { useState, useRef, useEffect } from "react";

interface ChatPanelProps {
  target: string;
  rawText: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function ChatPanel({ target, rawText }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || streaming) return;
    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
    };

    setMessages((prev) => {
      const next = [...prev, userMsg, assistantMsg];
      return next.slice(-20);
    });
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, reportText: rawText, target }),
      });

      if (!res.ok || !res.body) throw new Error("Chat failed");

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
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "text" && event.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: m.text + event.text } : m
                )
              );
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: "ERROR: " + (err instanceof Error ? err.message : "failed") }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-5 border border-[#1e1e2e] bg-[#0d0d14]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#111118] transition-colors border-b border-[#1e1e2e]"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-amber-400 font-bold tracking-widest">
            ASK ABOUT {target.toUpperCase()}
          </span>
          {messages.length > 0 && (
            <span className="font-mono text-xs bg-amber-400 text-black px-1.5 py-0.5 font-bold">
              {messages.length}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col">
          {messages.length > 0 && (
            <div
              ref={listRef}
              className="max-h-96 overflow-y-auto px-5 py-4 flex flex-col gap-4 border-b border-[#1e1e2e]"
            >
              {messages.map((m) => (
                <div key={m.id} className="flex flex-col gap-1">
                  <div className="font-mono text-xs tracking-widest text-gray-600">
                    {m.role === "user" ? "YOU" : "ANALYST"}
                  </div>
                  <div
                    className={`text-sm leading-relaxed font-sans whitespace-pre-wrap ${
                      m.role === "user" ? "text-amber-400" : "text-gray-300"
                    }`}
                  >
                    {m.text}
                    {m.role === "assistant" && streaming && !m.text && (
                      <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse align-text-bottom" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 p-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this report..."
              disabled={streaming}
              className="flex-1 bg-[#111118] border border-[#1e1e2e] focus:border-amber-400 text-white font-sans text-sm px-4 py-3 outline-none transition-colors placeholder:text-gray-600 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={streaming || !input.trim()}
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-[#1e1e2e] disabled:text-gray-600 text-black font-mono font-bold text-xs tracking-[0.2em] uppercase px-6 transition-colors disabled:cursor-not-allowed"
            >
              {streaming ? "..." : "SEND"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
