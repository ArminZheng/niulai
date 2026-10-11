// Client-side translation tool configuration. Everything lives in the browser:
// the config is persisted to a cookie and the request goes straight from the
// visitor's browser to their own OpenAI-compatible endpoint, so niulai's
// server never sees the API key (same trust model as the theme cookie).

export const TRANSLATE_CONFIG_COOKIE = "niulai-translate-config";

export type TranslateConfig = {
  apiKey: string;
  /** API Base URL or a full .../chat/completions endpoint. */
  baseUrl: string;
  /** Display label, e.g. "sensenova". */
  serviceName: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
};

export const DEFAULT_SYSTEM_PROMPT = `You are a professional {{to}} native translator. Translate each source item accurately and fluently into {{to}}.

## Translation Requirements
- Treat each source item as a complete translation unit, including a single word, short phrase, heading, label, or site name. Do not ask for more context, a full article, or additional text.
- Return only the translated content for each item, following the required response format. Do not add explanations, apologies, greetings, or commentary. If an item should remain untranslated, return it unchanged.
- Preserve its meaning, tone, paragraph structure, and meaningful formatting.
- Keep code, placeholders, and content that must not be translated unchanged.
- Use supplied document context and terminology consistently.

{{title_prompt}}{{summary_prompt}}{{terms_prompt}}

{{imt_style_guide}}`;

export const DEFAULT_USER_PROMPT = `Translate to {{to}}:

{{text}}`;

export const DEFAULT_CONFIG: TranslateConfig = {
  apiKey: "",
  baseUrl: "",
  serviceName: "",
  model: "",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  userPrompt: DEFAULT_USER_PROMPT,
};

// Optional placeholders the model may see but we don't populate yet; blank
// them so the prompt stays clean instead of leaking literal template tags.
const BLANK_PLACEHOLDERS = ["title_prompt", "summary_prompt", "terms_prompt", "imt_style_guide"];

export function renderTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  for (const key of BLANK_PLACEHOLDERS) {
    out = out.split(`{{${key}}}`).join("");
  }
  return out;
}

/** Normalise the endpoint: a bare base gets the chat/completions suffix. */
export function resolveEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  return /\/chat\/completions$/.test(trimmed) ? trimmed : `${trimmed}/chat/completions`;
}

export function parseConfig(raw: string | undefined): TranslateConfig {
  if (!raw) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(decodeURIComponent(raw)) as Partial<TranslateConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}
