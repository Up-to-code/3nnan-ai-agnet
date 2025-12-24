"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Message } from "@/components/chat/types";
import { ChatLoadingSkeleton } from "@/components/chat/loading-skeleton";
import { onEvent, EVENTS } from "@/lib/events";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLoading(false);
  }, []);

  // Listen for conversation deleted event
  useEffect(() => {
    return onEvent(EVENTS.CONVERSATION_DELETED, clearMessages);
  }, [clearMessages]);

  useEffect(() => {
    // Immediately clear messages if it's a new conversation
    if (conversationId === "new" || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Load conversation messages
    setLoading(true);
    fetch(`/api/conversations/${conversationId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data for demo
        import("@/lib/mock-messages")
          .then(({ mockMessages }) => {
            // Simulate loading delay for better UX
            setTimeout(() => {
              setMessages(mockMessages[conversationId] || []);
              setLoading(false);
            }, 800);
          })
          .catch(() => {
            setMessages([]);
            setLoading(false);
          });
      });
  }, [conversationId]);

  if (loading) {
    return (
      <div
        className="flex flex-col h-full bg-background/50 relative overflow-hidden"
        dir="rtl"
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain overscroll-y-contain flex justify-center"
          style={{ 
            paddingTop: "56px",
            paddingBottom: "200px",
            scrollPaddingBottom: "200px"
          }}
        >
          <div className="min-h-full flex flex-col w-full max-w-3xl px-4">
            <div className="w-full pt-4 sm:pt-6 pb-4 sm:pb-6 flex-1">
              <ChatLoadingSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      key={conversationId || "new"}
      conversationId={conversationId === "new" ? null : conversationId}
      initialMessages={messages}
    />
  );
}
