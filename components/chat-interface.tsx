"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export function ChatInterface() {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [model, setModel] = useState<'standard' | 'pro'>('standard');
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: model === 'pro'
                    ? `مرحباً! أنا عنان برو. سأساعدك في: "${content}"`
                    : `مرحباً! أنا عنان. سأساعدك في: "${content}"`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden" dir="rtl">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto relative flex flex-col">
                    <AnimatePresence mode="wait">
                        {messages.length === 0 ? (
                            <motion.div
                                key="hub"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center p-4"
                            >
                                <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <img src="/logo.png" alt="Anan Logo" className="relative w-full h-full object-contain drop-shadow-2xl" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-center tracking-tight">
                                    عنـان
                                </h1>
                                <p className="text-muted-foreground text-lg mb-8">كيف يمكنني مساعدتك في عقاراتك اليوم؟</p>

                                {/* Quick Starters */}
                                <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4">
                                    <button
                                        onClick={() => handleSend("ابحث لي عن فيلا في شمال الرياض")}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm px-4 py-2 rounded-full transition-colors"
                                    >
                                        🏡 فيلا شمال الرياض
                                    </button>
                                    <button
                                        onClick={() => handleSend("تحليل أسعار العقار في جدة")}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm px-4 py-2 rounded-full transition-colors"
                                    >
                                        📊 تحليل الأسعار
                                    </button>
                                    <button
                                        onClick={() => handleSend("نصيحة للاستثمار العقاري")}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm px-4 py-2 rounded-full transition-colors"
                                    >
                                        💡 نصيحة استثمارية
                                    </button>
                                    <button
                                        onClick={() => handleSend("أفضل الأحياء في الدمام")}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm px-4 py-2 rounded-full transition-colors"
                                    >
                                        📍 أحياء الدمام
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="thread"
                                className="flex-1 px-4 lg:px-0 w-full max-w-3xl mx-auto pb-32 pt-4"
                            >
                                {messages.map((msg) => (
                                    <ChatBubble
                                        key={msg.id}
                                        message={msg.content}
                                        isAi={msg.role === 'assistant'}
                                        timestamp={msg.timestamp}
                                    />
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                            <span className="text-primary-foreground text-xs">AI</span>
                                        </div>
                                        <div className="text-muted-foreground text-sm animate-pulse">
                                            جاري التفكير...
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4">
                    <ChatInput
                        onSend={handleSend}
                        disabled={isLoading}
                        model={model}
                        onModelChange={setModel}
                    />
                </div>
            </main>
        </div>
    );
}
