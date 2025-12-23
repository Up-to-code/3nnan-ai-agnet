import { ChatInterface } from "@/components/chat-interface";

export const metadata = {
  title: "عنان AI - رفيقك العقاري",
  description: "المساعد الذكي للبحث عن العقارات في السعودية",
};

export default function Home() {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden font-sans rtl" dir="rtl">
      <ChatInterface />
    </div>
  );
}
