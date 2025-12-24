"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "./types";
import { CouponCard } from "./chat-data-views";
import { ComponentMapper } from "./component-mapper";
import { MarkdownContent } from "./markdown-content";

interface ChatBubbleProps {
    message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const { content, isAi, timestamp, type, data } = message;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            dir="rtl"
            className={cn(
                "flex w-full gap-3 mb-6 group",
                isAi ? "flex-row" : "flex-row-reverse"
            )}
            style={{ scrollMarginBottom: "20px" }}
        >
            {/* Avatar */}
            <Avatar className={cn(
                "h-9 w-9 mt-1 shrink-0 border transition-all duration-300",
                isAi
                    ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white"
                    : "bg-secondary border-transparent text-secondary-foreground"
            )}>
                <AvatarFallback className="text-xs bg-transparent">
                    {isAi ? <Bot className="h-5 w-5" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>

            {/* Content Wrapper */}
            <div className={cn(
                "flex flex-col",
                isAi ? "items-start w-full max-w-full" : "items-end max-w-[85%] sm:max-w-[75%]"
            )}>

                {/* Name & Time Row */}
                <div className={cn(
                    "flex items-center gap-2 mb-1 px-1 w-full",
                    isAi ? "justify-start" : "justify-end"
                )}>
                    <span className="text-xs font-bold text-foreground/60">
                        {isAi ? "عنان AI" : "أنت"}
                    </span>
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {timestamp}
                    </span>
                </div>

                {/* Message Bubble */}
                <div className={cn(
                    "break-words transition-all duration-200 flex flex-col gap-4",
                    isAi
                        ? "w-full" // AI messages: full width, no bubble
                        : "px-4 py-3 text-[15px] sm:text-base bg-primary text-primary-foreground rounded-2xl rounded-tl-sm hover:bg-primary/95 shadow-md shadow-primary/10 leading-relaxed"
                )}>
                    {/* AI Messages: Notion-style markdown */}
                    {isAi && content && (
                        <div className="w-full prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                            <MarkdownContent content={content} />
                        </div>
                    )}
                    
                    {/* User Messages: Regular text */}
                    {!isAi && content && (
                        <p className="whitespace-pre-wrap text-right leading-relaxed break-words overflow-wrap-anywhere">
                            {content}
                        </p>
                    )}

                    {/* Component Mapper - Handles all structured data */}
                    {isAi && type && type !== "text" && data && (
                        <div className="mt-4 w-full">
                            {type === "coupon" ? (
                                <CouponCard coupon={data} />
                            ) : type === "streaming" ? (
                                <ComponentMapper type={type as any} data={data} />
                            ) : (
                                <ComponentMapper type={type as any} data={data} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
