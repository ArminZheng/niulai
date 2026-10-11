import { NextResponse } from "next/server";
import { resolveEndpoint } from "@/lib/translation";

// The browser cannot call most AI endpoints directly (they don't send CORS
// headers), so translation requests proxy through here: browser → same-origin
// route → the visitor's own endpoint. The API key passes through in memory
// only — it is read from the request body and forwarded, never stored or
// logged. Single-tenant site, so the key is the owner's anyway.
export async function POST(request: Request) {
  let body: { baseUrl?: string; apiKey?: string; model?: string; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体。" }, { status: 400 });
  }

  const { baseUrl, apiKey, model, messages } = body;
  if (!baseUrl || !apiKey || !model || !messages) {
    return NextResponse.json({ error: "缺少必要参数。" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(resolveEndpoint(baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: false }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "无法连接翻译服务。";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `上游错误 ${upstream.status}:${text.slice(0, 200)}` },
      { status: upstream.status },
    );
  }
  // Pass the JSON straight through; the client reads choices[0].message.content.
  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
