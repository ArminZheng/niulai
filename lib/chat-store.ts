// Browser-local chat history. The whole conversation tree lives in
// localStorage (never sent to niulai's server), keyed by session id. This is
// a client-only module — every function guards on `window` so it can be
// imported from a client component without tripping SSR.

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  at: number; // epoch ms, for bubble timestamps
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = "niulai-chat-sessions";

function read(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** Newest-updated first, for the sidebar. */
export function listSessions(): ChatSession[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSession(id: string): ChatSession | null {
  return read().find((s) => s.id === id) ?? null;
}

export function createSession(): ChatSession {
  const session: ChatSession = {
    id: `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: "新会话",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  write([session, ...read()]);
  return session;
}

/** Append a message and bump updatedAt. Titles itself from the first user line. */
export function appendMessage(sessionId: string, message: ChatMessage): ChatSession | null {
  const sessions = read();
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return null;
  target.messages.push(message);
  target.updatedAt = Date.now();
  if (target.title === "新会话" && message.role === "user") {
    target.title = message.content.slice(0, 30) || target.title;
  }
  write(sessions);
  return target;
}

export function deleteSession(id: string): void {
  write(read().filter((s) => s.id !== id));
}

export function renameSession(id: string, title: string): void {
  const sessions = read();
  const target = sessions.find((s) => s.id === id);
  if (target) {
    target.title = title;
    write(sessions);
  }
}
