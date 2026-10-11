import { ChatTool } from "@/components/chat/ChatTool";

export const metadata = { title: "chat — niulai" };

// Pure client-side chat: history lives in localStorage, AI calls proxy through
// /api/chat using the same service config as the translation tool.
export default function ChatPage() {
  return (
    <article>
      <h1>chat</h1>
      <ChatTool />
    </article>
  );
}
