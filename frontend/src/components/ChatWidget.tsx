"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatAvatar, { type ChatAvatarMode } from "@/components/ChatAvatar";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ApiResponse = {
  answer: string;
  suggestions?: string[];
  needsClarification?: boolean;
  clarificationKey?: "class" | "result-type" | "general";
};

const QUICK_ACTIONS = ["Courses batao", "Admission kaise hoga", "Result link", "Contact number"];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAnswerLinks(text: string) {
  return text.replace(/(^|\s)(\/[-a-zA-Z0-9/_?=&]+)/g, (_, prefix, path) => `${prefix}${siteUrl}${path}`);
}

function renderMessageContent(text: string) {
  const normalized = normalizeAnswerLinks(text);
  const lines = normalized.split("\n");

  return lines.map((line, index) => {
    const parts = line.split(/(https?:\/\/[^\s]+)/g);

    return (
      <div key={`${line}-${index}`}>
        {parts.map((part, partIndex) => {
          if (/^https?:\/\//.test(part)) {
            const isInternal = part.startsWith(siteUrl);
            const href = isInternal ? part.replace(siteUrl, "") || "/" : part;

            return isInternal ? (
              <Link
                key={`${part}-${partIndex}`}
                href={href}
                className="font-semibold text-cyan-600 underline underline-offset-2"
              >
                {part}
              </Link>
            ) : (
              <a
                key={`${part}-${partIndex}`}
                href={part}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-600 underline underline-offset-2"
              >
                {part}
              </a>
            );
          }

          return <span key={`${part}-${partIndex}`}>{part}</span>;
        })}
      </div>
    );
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState<ChatAvatarMode>("idle");
  const [pendingClarification, setPendingClarification] = useState<"class" | "result-type" | "general" | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      text:
        "Welcome! Main LKD Classes assistant hoon. Aap courses, admission, results, founder, achievements aur contact ke baare me poochh sakte hain.",
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_ACTIONS);
  const abortRef = useRef<AbortController | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  function triggerSpeakingEffect(answer: string) {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }

    setAvatarMode("speaking");
    const duration = Math.min(Math.max(answer.length * 22, 1200), 3200);
    speakingTimeoutRef.current = setTimeout(() => {
      setAvatarMode("idle");
    }, duration);
  }

  function applyClarificationContext(message: string) {
    const trimmed = message.trim();
    if (!pendingClarification) return trimmed;

    if (pendingClarification === "class") {
      if (/^(6|7|8|9|10|11|12)$/.test(trimmed)) {
        return `Class ${trimmed} fee`;
      }
      if (/^class\s*(6|7|8|9|10|11|12)$/i.test(trimmed)) {
        return `${trimmed} fee`;
      }
      if (/competition/i.test(trimmed)) {
        return "Competition fee";
      }
    }

    if (pendingClarification === "result-type") {
      const lower = trimmed.toLowerCase();
      if (lower.includes("link")) return "Result link";
      if (lower.includes("tse")) return "TSE result";
      if (lower.includes("certificate")) return "Certificate";
    }

    return trimmed;
  }

  async function sendMessage(message: string) {
    const raw = message.trim();
    if (!raw || loading) return;

    const trimmed = applyClarificationContext(raw);

    setMessages((prev) => [...prev, { id: createId(), role: "user", text: raw }]);
    setInput("");
    setLoading(true);
    setAvatarMode("listening");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: abortRef.current.signal,
      });

      const data = (await response.json()) as ApiResponse & { error?: string };
      const answer = data.answer || data.error || `For direct help, call ${process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522"}.`;

      setMessages((prev) => [...prev, { id: createId(), role: "assistant", text: answer }]);
      triggerSpeakingEffect(answer);

      setPendingClarification(data.needsClarification ? data.clarificationKey ?? "general" : null);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions.slice(0, 4));
      }
    } catch {
      const answer = `Abhi response me issue aa raha hai. Open Contact Page: ${siteUrl}/contact`;
      setMessages((prev) => [...prev, { id: createId(), role: "assistant", text: answer }]);
      triggerSpeakingEffect(answer);
      setPendingClarification(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open ? (
        <div className="fixed bottom-5 right-5 z-50 flex items-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative"
            aria-label="Open chat"
          >
            <div className="absolute -left-[106px] bottom-3 hidden md:block">
              <div className="relative rounded-2xl border border-indigo-100 bg-white/95 px-4 py-2.5 text-xs font-medium text-slate-700 shadow-lg backdrop-blur">
                Need help?
                <span className="absolute -right-2 bottom-4 h-4 w-4 rotate-45 border-r border-b border-indigo-100 bg-white/95" />
              </div>
            </div>
            <ChatAvatar size={68} mode={avatarMode} active={false} hoverable />
          </button>
        </div>
      ) : null}

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

          <div className="fixed inset-x-0 bottom-0 z-50 flex h-[82svh] flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white/95 shadow-[0_-20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl md:inset-x-auto md:top-10 md:bottom-24 md:right-5 md:h-[36rem] md:w-[25rem] md:max-w-[calc(100vw-1.5rem)] md:rounded-[28px]">
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-slate-300 md:hidden" />

            <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 px-4 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ChatAvatar size={48} mode={avatarMode} active={open || loading} hoverable={false} />
                  <div>
                    <h3 className="text-sm font-bold">LKD Classes Assistant</h3>
                    <p className="text-xs text-blue-50">English + Hinglish support</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white transition hover:bg-white/25"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "ml-auto bg-indigo-600 text-white shadow-lg"
                      : "border border-slate-100 bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  <div className="space-y-1 whitespace-pre-line">{renderMessageContent(message.text)}</div>
                </div>
              ))}

              {loading ? (
                <div className="flex max-w-[85%] items-end gap-2">
                  <ChatAvatar size={28} mode="listening" active hoverable={false} className="shrink-0" />
                  <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-100 bg-white p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item)}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onFocus={() => !loading && setAvatarMode("listening")}
                  onBlur={() => !loading && setAvatarMode("idle")}
                  placeholder="Type your message..."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
