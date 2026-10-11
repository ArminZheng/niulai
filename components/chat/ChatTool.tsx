"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONFIG,
  TRANSLATE_CONFIG_COOKIE,
  type TranslateConfig,
} from "@/lib/translation";
import {
  appendMessage,
  createSession,
  deleteSession,
  listSessions,
  type ChatSession,
} from "@/lib/chat-store";

function readConfig(): TranslateConfig {
  const m = document.cookie.match(new RegExp(`(?:^|; )${TRANSLATE_CONFIG_COOKIE}=([^;]*)`));
  if (!m || !m[1]) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(decodeURIComponent(m[1])) as Partial<TranslateConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function ChatTool() {
  const [cfg] = useState<TranslateConfig>(() =>
    typeof window === "undefined" ? DEFAULT_CONFIG : readConfig(),
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history once on mount; start a fresh session if none exist yet.
  useEffect(() => {
    const existing = listSessions();
    if (existing.length === 0) {
      const s = createSession();
      setSessions([s]);
      setActiveId(s.id);
    } else {
      setSessions(existing);
      setActiveId(existing[0]?.id ?? null);
    }
  }, []);

  const active = sessions.find((s) => s.id === activeId) ?? null;

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages.length, busy]);

  const configured =
    cfg.apiKey.trim() !== "" && cfg.baseUrl.trim() !== "" && cfg.model.trim() !== "";

  function refresh() {
    setSessions(listSessions());
  }

  function newChat() {
    const s = createSession();
    refresh();
    setActiveId(s.id);
    setError(null);
  }

  function removeChat(id: string) {
    deleteSession(id);
    const remaining = listSessions();
    setSessions(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id ?? null);
    }
  }

  async function send() {
    setError(null);
    const text = draft.trim();
    if (!text || !active) return;
    if (!configured) {
      setError("请先在 translation 栏目配置 AI 服务（Key / 地址 / 模型）。");
      return;
    }
    setBusy(true);
    setDraft("");

    // Optimistically record the user's line, then send the full thread so the
    // model sees the conversation so far.
    const withUser = appendMessage(active.id, { role: "user", content: text, at: Date.now() });
    setSessions(listSessions());
    const thread = (withUser?.messages ?? []).map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: cfg.baseUrl,
          apiKey: cfg.apiKey,
          model: cfg.model,
          messages: thread,
        }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const j = (await res.json()) as { error?: string };
          detail = j.error ?? "";
        } catch {
          /* non-JSON error */
        }
        throw new Error(detail || `请求失败 ${res.status}`);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
      appendMessage(active.id, { role: "assistant", content: reply || "(空响应)", at: Date.now() });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败,请检查网络与配置。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-tool">
      <aside className="chat-sidebar">
        <button type="button" className="chat-new" onClick={newChat}>
          + 新会话
        </button>
        <ul className="chat-list">
          {sessions.map((s) => (
            <li key={s.id} className={s.id === activeId ? "active" : ""}>
              <button type="button" className="chat-item" onClick={() => setActiveId(s.id)}>
                {s.title}
              </button>
              <button
                type="button"
                className="chat-del"
                title="删除会话"
                onClick={() => removeChat(s.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="chat-main">
        <div className="chat-scroll" ref={scrollRef}>
          {!active || active.messages.length === 0 ? (
            <p className="chat-empty">开始对话吧。</p>
          ) : (
            active.messages.map((m, i) => (
              <div key={i} className={`bubble-row ${m.role}`}>
                <div className={`bubble ${m.role}`}>
                  <div className="bubble-text">{m.content}</div>
                  <div className="bubble-time">
                    {new Date(m.at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))
          )}
          {busy ? (
            <div className="bubble-row assistant">
              <div className="bubble assistant">
                <div className="bubble-text">思考中…</div>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="chat-error">{error}</p> : null}

        <div className="chat-input">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="输入消息,Enter 发送,Shift+Enter 换行"
            rows={2}
            onKeyDown={(e) => {
              // IME composition: the Enter that confirms a CJK candidate (or
              // commits Latin text typed inside the IME) must not send. Only a
              // bare Enter outside composition sends; Shift+Enter newlines.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!busy) void send();
              }
            }}
          />
          <button type="button" onClick={() => void send()} disabled={busy || !draft.trim()}>
            发送
          </button>
        </div>
      </section>
    </div>
  );
}
