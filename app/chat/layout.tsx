import { Sidebar } from "@/components/layout/sidebar";
import { ChatNavbar } from "@/components/layout/chat-navbar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <ChatNavbar />
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}

