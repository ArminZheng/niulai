"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_CONFIG,
  TRANSLATE_CONFIG_COOKIE,
  renderTemplate,
  type TranslateConfig,
} from "@/lib/translation";

const LANGS = ["中文", "English", "日本語", "한국어", "Français", "Deutsch", "Español"];

function readConfig(): TranslateConfig {
  const m = document.cookie.match(new RegExp(`(?:^|; )${TRANSLATE_CONFIG_COOKIE}=([^;]*)`));
  if (!m || !m[1]) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(decodeURIComponent(m[1])) as Partial<TranslateConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(cfg: TranslateConfig): void {
  const v = encodeURIComponent(JSON.stringify(cfg));
  // one year, readable client-side (no HttpOnly) since the browser owns it.
  document.cookie = `${TRANSLATE_CONFIG_COOKIE}=${v}; path=/; max-age=31536000; samesite=lax`;
}

export function TranslateTool() {
  const [cfg, setCfg] = useState<TranslateConfig>(DEFAULT_CONFIG);
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [target, setTarget] = useState("English");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setCfg(readConfig());
  }, []);

  const configured = cfg.apiKey.trim() !== "" && cfg.baseUrl.trim() !== "" && cfg.model.trim() !== "";

  async function translate() {
    setError(null);
    const text = source.trim();
    if (!text) {
      setError("请输入要翻译的内容。");
      return;
    }
    if (!configured) {
      setError("请先配置 AI 服务（API Key / 接口地址 / 模型）。");
      setShowSettings(true);
      return;
    }
    setBusy(true);
    setOutput("");
    try {
      // Proxy through our own origin to dodge the endpoint's missing CORS
      // headers; the key rides along in the body (see app/api/translate).
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: cfg.baseUrl,
          apiKey: cfg.apiKey,
          model: cfg.model,
          messages: [
            { role: "system", content: renderTemplate(cfg.systemPrompt, { to: target, text }) },
            { role: "user", content: renderTemplate(cfg.userPrompt, { to: target, text }) },
          ],
        }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const j = (await res.json()) as { error?: string };
          detail = j.error ?? "";
        } catch {
          /* non-JSON error body */
        }
        throw new Error(detail || `请求失败 ${res.status}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content?.trim() ?? "";
      setOutput(content || "(空响应)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "翻译失败,请检查网络与配置。");
    } finally {
      setBusy(false);
    }
  }

  function saveConfig(next: TranslateConfig) {
    setCfg(next);
    writeConfig(next);
  }

  return (
    <div className="translate-tool">
      <div className="translate-bar">
        <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="目标语言">
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button type="button" onClick={translate} disabled={busy}>
          {busy ? "翻译中…" : "翻译"}
        </button>
        <span className="spacer" />
        <button type="button" onClick={() => setShowSettings((s) => !s)}>
          {showSettings ? "收起配置" : "配置服务"}
        </button>
      </div>

      {showSettings ? <SettingsPanel cfg={cfg} onSave={saveConfig} /> : null}

      {error ? <p className="translate-error">{error}</p> : null}

      <div className="translate-panes">
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="输入要翻译的文本…"
          rows={14}
          aria-label="原文"
        />
        <textarea value={output} readOnly placeholder="翻译结果…" rows={14} aria-label="译文" />
      </div>
    </div>
  );
}

function SettingsPanel({ cfg, onSave }: { cfg: TranslateConfig; onSave: (c: TranslateConfig) => void }) {
  const [draft, setDraft] = useState(cfg);
  const [showKey, setShowKey] = useState(false);
  useEffect(() => setDraft(cfg), [cfg]);

  const set = <K extends keyof TranslateConfig>(key: K, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <form
      className="translate-settings"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <label>
        服务名称
        <input
          value={draft.serviceName}
          onChange={(e) => set("serviceName", e.target.value)}
          placeholder="sensenova"
        />
      </label>
      <label>
        API Key
        <span className="key-row">
          <input
            type={showKey ? "text" : "password"}
            value={draft.apiKey}
            onChange={(e) => set("apiKey", e.target.value)}
            placeholder="sk-…"
            autoComplete="off"
          />
          <label className="key-toggle">
            <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} /> 显示
          </label>
        </span>
      </label>
      <label>
        接口地址
        <input
          value={draft.baseUrl}
          onChange={(e) => set("baseUrl", e.target.value)}
          placeholder="https://openrouter.ai/api/v1 或 …/chat/completions"
        />
      </label>
      <label>
        模型
        <input value={draft.model} onChange={(e) => set("model", e.target.value)} placeholder="glm-5.2" />
      </label>
      <label>
        System Prompt
        <textarea
          value={draft.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value)}
          rows={8}
        />
      </label>
      <label>
        User Prompt
        <textarea
          value={draft.userPrompt}
          onChange={(e) => set("userPrompt", e.target.value)}
          rows={4}
        />
      </label>
      <div className="settings-actions">
        <button type="submit">保存配置</button>
        <button type="button" onClick={() => setDraft(DEFAULT_CONFIG)}>
          恢复默认
        </button>
      </div>
      <small>配置保存在浏览器 cookie,不会上传到服务器。</small>
    </form>
  );
}
