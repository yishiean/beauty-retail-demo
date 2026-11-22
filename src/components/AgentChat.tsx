import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Settings, X } from "lucide-react";
import { track } from "@/utils/amplitude";

const AGENT_NAME = "Beauty Agent";
const AGENT_ID = "beauty-agent";
const API_KEY = "0fb41f6b8545d79dd693fac3e7c589b5";
const SYSTEM_PROMPT = `You are ${AGENT_NAME} — a helpful AI assistant for this app. Keep responses concise and friendly, and never make up account-specific details.`;
const TURN_END_RE = /\n*\[turn-end:(\{[^\n]*\})\]\s*$/;
const CONFIG_KEY = "agent-chat-config";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Config = {
  endpoint: string;
  agentId: string;
  apiKey: string;
  serverZone: "US" | "EU";
  systemPrompt: string;
};
type Identity = {
  apiKey: string;
  deviceId: string;
  sessionId: number;
  userId?: string;
  serverZone: "US" | "EU";
};

const defaultConfig: Config = {
  endpoint: "/api/agent-chat",
  agentId: AGENT_ID,
  apiKey: API_KEY,
  serverZone: "US",
  systemPrompt: SYSTEM_PROMPT,
};

// Stable per-page-load fallbacks (never regenerated per send).
const fallbackDeviceId = `web-${Math.random().toString(36).slice(2, 12)}`;
const fallbackSessionId = Date.now();

type AmplitudeLike = {
  getDeviceId?: () => string | undefined;
  getSessionId?: () => number | undefined;
  getUserId?: () => string | undefined;
};

function amp(): AmplitudeLike | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { amplitude?: AmplitudeLike }).amplitude;
}

function readIdentity(cfg: Config): Identity {
  const a = amp();
  return {
    apiKey: cfg.apiKey,
    deviceId: a?.getDeviceId?.() || fallbackDeviceId,
    sessionId: Number(a?.getSessionId?.() ?? fallbackSessionId),
    userId: a?.getUserId?.() || undefined,
    serverZone: cfg.serverZone,
  };
}

function extractTurnEnd(full: string) {
  const m = full.match(TURN_END_RE);
  if (!m) return { text: full, payload: null as null | { status?: string } };
  let payload: { status?: string } | null = null;
  try {
    payload = JSON.parse(m[1]);
  } catch {
    payload = null;
  }
  return { text: full.replace(TURN_END_RE, ""), payload };
}

function loadConfig(): Config {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    return raw ? { ...defaultConfig, ...(JSON.parse(raw) as Partial<Config>) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export function AgentChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [identity, setIdentity] = useState<Identity>(() => readIdentity(defaultConfig));

  const historyRef = useRef<Msg[]>([]);
  const hadSuccessRef = useRef(false);
  const sessionIdRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const attemptRef = useRef(1);
  const configRef = useRef(config);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const c = loadConfig();
    setConfig(c);
    configRef.current = c;
    setIdentity(readIdentity(c));
  }, []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, waiting]);

  const dispatchSessionComplete = useCallback(
    (opts?: { beacon?: boolean; sessionId?: number }) => {
      const cfg = configRef.current;
      if (!hadSuccessRef.current) return;
      if (!cfg.apiKey) return;
      if (historyRef.current.length === 0) return;
      hadSuccessRef.current = false;

      const id = readIdentity(cfg);
      if (opts?.sessionId) id.sessionId = opts.sessionId;
      const body = JSON.stringify({
        messages: historyRef.current.map((m) => ({ role: m.role, content: m.content })),
        agentId: cfg.agentId,
        hadSuccess: true,
        amplitude: id,
      });
      const url = "/api/agent-session-complete";

      if (opts?.beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        return;
      }
      void fetch(url, {
        method: "POST",
        keepalive: true,
        headers: {
          "content-type": "application/json",
          "x-amplitude-api-key": id.apiKey,
          "x-amplitude-device-id": id.deviceId,
          "x-amplitude-session-id": String(id.sessionId),
          "x-amplitude-server-zone": id.serverZone,
          ...(id.userId ? { "x-amplitude-user-id": id.userId } : {}),
        },
        body,
      }).catch(() => {});
    },
    [],
  );

  // Trigger B — pagehide
  useEffect(() => {
    const onPageHide = () => dispatchSessionComplete({ beacon: true });
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [dispatchSessionComplete]);

  // Trigger C — session rotation
  useEffect(() => {
    sessionIdRef.current = readIdentity(configRef.current).sessionId;
    const t = setInterval(() => {
      const current = Number(amp()?.getSessionId?.() ?? sessionIdRef.current);
      if (sessionIdRef.current && current && current !== sessionIdRef.current) {
        dispatchSessionComplete({ sessionId: sessionIdRef.current });
        sessionIdRef.current = current;
      }
    }, 30_000);
    return () => clearInterval(t);
  }, [dispatchSessionComplete]);

  const stop = () => abortRef.current?.abort();

  const streamTurn = async () => {
    const cfg = configRef.current;
    const id = readIdentity(cfg);
    setIdentity(id);
    setWaiting(true);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let full = "";
    let started = false;

    try {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-amplitude-api-key": id.apiKey,
          "x-amplitude-device-id": id.deviceId,
          "x-amplitude-session-id": String(id.sessionId),
          "x-amplitude-server-zone": id.serverZone,
          ...(id.userId ? { "x-amplitude-user-id": id.userId } : {}),
        },
        body: JSON.stringify({
          messages: historyRef.current.map((m) => ({ role: m.role, content: m.content })),
          agentId: cfg.agentId,
          systemPrompt: cfg.systemPrompt,
          amplitude: id,
        }),
      });

      if (!res.ok || !res.body) {
        const bodyText = await res.text().catch(() => "");
        console.error("[agent-chat] request failed", res.status, bodyText);
        setWaiting(false);
        setStreaming(false);
        setMessages([
          ...historyRef.current,
          { role: "assistant", content: "Sorry, something went wrong. Please try again.", error: true },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        if (!started) {
          started = true;
          setWaiting(false);
        }
        const { text: visible } = extractTurnEnd(full);
        setMessages([...historyRef.current, { role: "assistant", content: visible }]);
      }

      const { text: finalText, payload } = extractTurnEnd(full);
      if (!payload || payload.status === "ok") hadSuccessRef.current = true;
      historyRef.current = [...historyRef.current, { role: "assistant", content: finalText }];
      setMessages([...historyRef.current]);
    } catch (err) {
      if (controller.signal.aborted) {
        const { text: partial } = extractTurnEnd(full);
        if (partial.trim()) {
          historyRef.current = [...historyRef.current, { role: "assistant", content: partial }];
          setMessages([...historyRef.current]);
        } else {
          setMessages([...historyRef.current, { role: "assistant", content: "Stopped." }]);
        }
      } else {
        console.error("[agent-chat] stream error", err);
        setMessages([
          ...historyRef.current,
          { role: "assistant", content: "Sorry, something went wrong. Please try again.", error: true },
        ]);
      }
    } finally {
      setWaiting(false);
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || streaming) return;
    historyRef.current = [...historyRef.current, { role: "user", content: text }];
    setMessages([...historyRef.current]);
    setDraft("");
    attemptRef.current = 1;
    await streamTurn();
  };

  const retry = async () => {
    if (streaming) return;
    // Drop the failed/last assistant turn so the trailing message is the user prompt.
    if (historyRef.current.at(-1)?.role === "assistant") {
      historyRef.current = historyRef.current.slice(0, -1);
    }
    if (historyRef.current.at(-1)?.role !== "user") return;
    attemptRef.current += 1;
    track("Retry Clicked", { "[Agent] Attempt Number": attemptRef.current });
    setMessages([...historyRef.current]);
    await streamTurn();
  };

  const reset = () => {
    dispatchSessionComplete(); // Trigger A — before clearing history
    historyRef.current = [];
    setMessages([]);
    inputRef.current?.focus();
  };

  const saveConfig = (next: Config) => {
    setConfig(next);
    configRef.current = next;
    try {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setIdentity(readIdentity(next));
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[560px] w-[min(400px,calc(100vw-2rem))] flex-col border border-border bg-background shadow-2xl">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-sephora-red text-xs font-bold text-primary-foreground">
          A
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold uppercase tracking-[0.14em]">{AGENT_NAME}</p>
          <p className="text-[11px] text-muted-foreground">
            {streaming ? "Typing…" : "Ready to chat"}
          </p>
        </div>
        <button onClick={reset} aria-label="Reset conversation" className="p-1.5 hover:text-sephora-red">
          <RotateCcw className="size-4" />
        </button>
        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Agent settings"
          className="p-1.5 hover:text-sephora-red"
        >
          <Settings className="size-4" />
        </button>
        <button onClick={onClose} aria-label="Close chat" className="p-1.5 hover:text-sephora-red">
          <X className="size-4" />
        </button>
      </div>

      {showSettings && (
        <div className="space-y-2 border-b border-border bg-secondary p-4 text-xs">
          {(
            [
              ["Endpoint", "endpoint"],
              ["Agent ID", "agentId"],
              ["Amplitude API key", "apiKey"],
            ] as const
          ).map(([label, key]) => (
            <label key={key} className="block">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
              <input
                value={config[key]}
                onChange={(e) => saveConfig({ ...config, [key]: e.target.value })}
                className="mt-1 w-full border border-border bg-background px-2 py-1"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Data residency
            </span>
            <select
              value={config.serverZone}
              onChange={(e) => saveConfig({ ...config, serverZone: e.target.value as "US" | "EU" })}
              className="mt-1 w-full border border-border bg-background px-2 py-1"
            >
              <option value="US">US</option>
              <option value="EU">EU</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              System prompt
            </span>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => saveConfig({ ...config, systemPrompt: e.target.value })}
              rows={3}
              className="mt-1 w-full border border-border bg-background px-2 py-1"
            />
          </label>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !waiting && (
          <div className="mt-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em]">Ask {AGENT_NAME}</p>
            <p className="mx-auto mt-2 max-w-[280px] text-xs text-muted-foreground">
              Get help with your questions. Each message streams from a backend with your device_id and
              session_id so events stitch to Session Replay.
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          if (m.role === "user") {
            return (
              <div key={i} className="flex items-end justify-end gap-2">
                <div className="max-w-[80%] rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {m.content}
                </div>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold">
                  U
                </span>
              </div>
            );
          }
          return (
            <div key={i} className="flex items-end gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sephora-red text-[10px] font-bold text-primary-foreground">
                A
              </span>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-sm px-3 py-2 text-sm ${
                  m.error ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
                }`}
              >
                {m.content}
                {streaming && isLast && !m.error && <span className="animate-pulse">▍</span>}
              </div>
              {isLast && !streaming && (
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-sephora-red"
                >
                  Retry
                </button>
              )}
            </div>
          );
        })}

        {waiting && (
          <div className="flex items-end gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sephora-red text-[10px] font-bold text-primary-foreground">
              A
            </span>
            <div className="flex gap-1 rounded-sm bg-secondary px-3 py-3">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          ref={inputRef}
          value={draft}
          rows={1}
          placeholder={`Ask ${AGENT_NAME}…`}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          className="max-h-[140px] flex-1 resize-none border border-border bg-background px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => (streaming ? stop() : void send())}
          className="rounded-sm bg-sephora-red px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
        >
          {streaming ? "Stop" : "Send"}
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-sephora-red" /> Amplitude live
        </span>
        <span>device_id: {identity.deviceId.slice(0, 8)}…</span>
      </div>
    </div>
  );
}