"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "./chat-input";
import { ChatBubble } from "./chat-bubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WelcomeScreen } from "./welcome-screen";
import { WritingEffect } from "./chat-effects";
import { Button } from "@/components/ui/button";
import { ArrowDown, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAnonymousChat } from "@/hooks/use-anonymous-chat";
import { useConversations } from "@/hooks/use-conversations";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { sendChatMessage } from "@/lib/api";
import { Message, ChatRequest } from "./types";
import { onEvent, EVENTS } from "@/lib/events";

// ============================================
// Types
// ============================================

interface ChatInterfaceProps {
  conversationId?: string | null;
  initialMessages?: Message[];
}

// ============================================
// Chat Interface Component
// ============================================

export function ChatInterface({ conversationId: propConversationId = null, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(propConversationId || null);
  // Initialize messages as empty if conversationId is null, otherwise use initialMessages
  const [messages, setMessages] = useState<Message[]>(() => {
    return propConversationId ? initialMessages : [];
  });
  const [status, setStatus] = useState<"idle" | "searching" | "writing">("idle");
  const [model, setModel] = useState<"standard" | "pro">("standard");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputHeight, setInputHeight] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(propConversationId || null);
  const initialMessagesRef = useRef<Message[]>(initialMessages);

  // Update initial messages ref when it changes
  useEffect(() => {
    initialMessagesRef.current = initialMessages;
  }, [initialMessages]);

  // Listen for conversation deleted event to clear chat immediately
  useEffect(() => {
    const cleanup = onEvent(EVENTS.CONVERSATION_DELETED, () => {
      // Clear all chat state immediately
      setMessages([]);
      setStatus("idle");
      setShowScrollButton(false);
      setConversationId(null);
      prevConversationIdRef.current = null;
      initialMessagesRef.current = [];
    });
    
    return cleanup;
  }, []);

  // Clear messages and reset state when conversationId changes
  useEffect(() => {
    const currentId = propConversationId || null;
    const prevId = prevConversationIdRef.current;
    
    // Always clear if conversation is null (new conversation)
    if (!currentId) {
      setMessages([]);
      setStatus("idle");
      setShowScrollButton(false);
      setConversationId(null);
      if (prevId !== null) {
        prevConversationIdRef.current = null;
      }
      return;
    }
    
    // Only update if conversation ID actually changed
    if (currentId !== prevId) {
      prevConversationIdRef.current = currentId;
      setConversationId(currentId);
      
      // Use initial messages from ref (or empty array if none)
      const messagesToSet = initialMessagesRef.current.length > 0 
        ? initialMessagesRef.current 
        : [];
      setMessages(messagesToSet);
    }
  }, [propConversationId]);

  // Auth and anonymous chat hooks
  const { isAuthenticated, user } = useAuth();
  const {
    remainingMessages,
    hasReachedLimit,
    canSendMessage,
    incrementCount,
    resetCount,
  } = useAnonymousChat();

  // Conversations hook - for creating and refreshing sidebar
  const { createNew, refresh: refreshConversations } = useConversations({
    userId: user?.id || "default-user", // Use user ID or fallback to default-user
    autoFetch: false, // Don't auto-fetch, we'll refresh manually when needed
  });

  // ============================================
  // Scroll Management
  // ============================================

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      if (behavior === "auto") {
        container.scrollTop = container.scrollHeight - container.clientHeight;
      } else {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior,
            block: "end",
            inline: "nearest",
          });
        } else {
          container.scrollTo({
            top: container.scrollHeight - container.clientHeight,
            behavior,
          });
        }
      }
    }
  }, []);

  // Track scroll position to show/hide scroll button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0 || status !== "idle") {
      const timer = setTimeout(() => {
        scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, status, scrollToBottom]);

  // Scroll to bottom when input height changes
  useEffect(() => {
    if (inputHeight > 0 && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [inputHeight, scrollToBottom, messages.length]);

  // ============================================
  // Auth Success Handler
  // ============================================

  const handleAuthSuccess = () => {
    resetCount();
    setShowAuthDialog(false);
    // Refresh conversations after auth
    refreshConversations();
  };

  // ============================================
  // Message Sending Handler
  // ============================================

  const handleSend = async (userMessage: string) => {
    // Check if anonymous user has reached limit
    if (!isAuthenticated && hasReachedLimit) {
      setShowAuthDialog(true);
      return;
    }

    // Increment count for anonymous users
    if (!isAuthenticated) {
      incrementCount();
    }

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isAi: false,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);
    setStatus("writing");

    try {
      // 2. Create conversation if new
      let currentConvId = conversationId;
      if (!currentConvId) {
        const title = userMessage.substring(0, 50);
        const newConversation = await createNew(title);

        if (newConversation && newConversation.id) {
          currentConvId = newConversation.id;
          setConversationId(currentConvId);
          // Update URL without triggering full page reload
          // This prevents interrupting the AI call
          window.history.replaceState(null, '', `/chat/${currentConvId}`);
        } else {
          throw new Error("Failed to create conversation - no ID returned");
        }
      }

      // 3. Send Chat Message (now won't be interrupted by navigation)
      const requestBody: ChatRequest = {
        message: userMessage,
        model,
        conversationId: currentConvId,
      };

      const result = await sendChatMessage(requestBody);

      // 4. Parse API Response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.content || "",
        isAi: true,
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        type: (result.type as Message["type"]) || "text",
        data: result.data || null,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 5. Refresh sidebar to show new conversation and update lastMessage
      if (currentConvId) {
        await refreshConversations();
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
          isAi: true,
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        },
      ]);
    } finally {
      setStatus("idle");
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="flex flex-col h-full bg-background/50 relative overflow-hidden" dir="rtl">
      {/* Remaining messages indicator for anonymous users */}
      {!isAuthenticated && messages.length > 0 && (
        <div className="absolute top-16 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg pointer-events-auto transition-colors ${
              remainingMessages <= 3
                ? "bg-amber-500/90 text-white"
                : "bg-card/90 text-muted-foreground border border-border/50"
            }`}
          >
            <MessageSquare className="h-3 w-3 inline-block ml-1" />
            {remainingMessages > 0 ? `${remainingMessages} رسائل متبقية` : "انتهت الرسائل المجانية"}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain overscroll-y-contain flex justify-center"
        style={{
          paddingTop: "56px",
          paddingBottom: inputHeight > 0 ? `${inputHeight + 20}px` : "200px",
          scrollPaddingBottom: inputHeight > 0 ? `${inputHeight + 20}px` : "200px",
        }}
      >
        <div className="min-h-full flex flex-col w-full max-w-3xl px-4">
          <div
            className={`w-full pt-4 sm:pt-6 pb-4 sm:pb-6 flex-1 ${
              messages.length === 0 ? "flex flex-col justify-center items-center min-h-full" : ""
            }`}
          >
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSend} userName={user?.name} />
            ) : (
              <div className="space-y-4 sm:space-y-6 w-full">
                {messages.map((msg, index) => (
                  <ChatBubble key={msg.id ?? `msg-${index}`} message={msg} />
                ))}

                {status === "writing" && (
                  <div className="flex gap-3 sm:gap-4 w-full flex-row animate-in fade-in slide-in-from-bottom-2">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 mt-0.5 border border-primary bg-primary shrink-0 shadow-lg shadow-primary/20">
                      <AvatarFallback className="text-white text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm max-w-[85%] sm:max-w-[90%]">
                      <WritingEffect />
                    </div>
                  </div>
                )}

                <div
                  ref={messagesEndRef}
                  className="h-px w-full"
                  style={{ marginBottom: inputHeight > 0 ? `${inputHeight + 20}px` : "200px" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && messages.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <Button
            onClick={() => scrollToBottom("smooth")}
            size="icon"
            variant="secondary"
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm hover:bg-card transition-all animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            dir="ltr"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fixed Input Area */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-4 pointer-events-none"
        style={{
          paddingBottom: `max(12px, env(safe-area-inset-bottom, 12px))`,
          paddingTop: "16px",
        }}
      >
        <div className="flex justify-center">
          <div className="w-full max-w-3xl px-4 pointer-events-auto">
            <ChatInput
              onSend={handleSend}
              isLoading={status !== "idle"}
              model={model}
              onModelChange={setModel}
              onHeightChange={setInputHeight}
              disabled={!isAuthenticated && hasReachedLimit}
              placeholder={
                !isAuthenticated && hasReachedLimit ? "سجل دخولك لمتابعة المحادثة..." : undefined
              }
            />

            {/* Show auth prompt when limit reached */}
            {!isAuthenticated && hasReachedLimit && (
              <div className="mt-3 text-center">
                <Button onClick={() => setShowAuthDialog(true)} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  سجل دخولك لمتابعة المحادثة
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} />
    </div>
  );
}
