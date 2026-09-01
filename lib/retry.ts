// Retry a DB READ once when the pooled connection died mid-query.
//
// Supabase's pooler reaps idle connections; pg can hand out a connection the
// server already closed, so the query throws "Connection terminated
// unexpectedly". The @prisma/adapter-pg then marks that connection unhealthy,
// so the retry gets a fresh one and succeeds. See memory:
// supabase-pooler-connection-terminated-transient.
//
// READS ONLY. Never wrap writes (create/update/delete/upsert/...) — a write
// that errored mid-flight may have partially committed, and retrying would
// duplicate the effect. Applied at explicit call sites (not hidden in the
// prisma Proxy) per CLAUDE.md §1.2 (explicit behavior over magic).

export async function withReadRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isTransientConnectionError(err)) {
      return await fn();
    }
    throw err;
  }
}

// Strings the pg driver raises when a pooled connection is dead. Kept tight —
// over-matching would turn real errors into silent double attempts. The
// lowercase compare covers pg's exact "Connection terminated unexpectedly".
function isTransientConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("connection terminated") ||
    msg.includes("connection ended") ||
    msg.includes("read econnreset")
  );
}
