import { NextResponse } from "next/server";
import { resolveEndpoint } from "@/lib/translation";

// Same-origin proxy for chat completions (see app/api/translate for the CORS
// reasoning). Unlike translate it takes the whole message list so the model
// keeps conversational context. The key forwards in memory only.
export async function POST(request: Request) {
  let body: { baseUrl?: string; apiKey?: string; model?: string; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体。" }, { status: 400 });
  }

  const { baseUrl, apiKey, model, messages } = body;
  if (!baseUrl || !apiKey || !model || !Array.isArray(messages)) {
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
    const msg = e instanceof Error ? e.message : "无法连接服务。";
    const cause =
      e instanceof Error && e.cause
        ? e.cause instanceof Error
          ? `${(e.cause as NodeJS.ErrnoException).code ?? ""} ${e.cause.message}`.trim()
          : String(e.cause)
        : "";
    console.error("chat upstream failed:", cause || msg);
    return NextResponse.json({ error: cause ? `${msg}(${cause})` : msg }, { status: 502 });
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `上游错误 ${upstream.status}:${text.slice(0, 200)}` },
      { status: upstream.status },
    );
  }
  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
