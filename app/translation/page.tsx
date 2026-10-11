import { TranslateTool } from "@/components/translation/TranslateTool";

export const metadata = { title: "translation — niulai" };

// Pure client-side tool: config lives in a cookie, requests go from the
// visitor's browser to their own AI endpoint. Nothing here touches the DB.
export default function TranslationPage() {
  return (
    <article>
      <h1>translation</h1>
      <TranslateTool />
    </article>
  );
}
