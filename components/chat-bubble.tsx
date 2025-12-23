"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface ChatBubbleProps {
    message: string;
    isAi?: boolean;
    timestamp?: string;
}

export function ChatBubble({ message, isAi, timestamp }: ChatBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("flex gap-3 mb-4", isAi ? "flex-row" : "flex-row-reverse")}
        >
            <Avatar className={cn("h-8 w-8 flex-shrink-0", isAi ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                <AvatarFallback className={cn(isAi ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>
            <div className={cn(
                "max-w-[80%] rounded-2xl p-4",
                isAi ? "bg-transparent" : "bg-secondary"
            )}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message}</p>
                {timestamp && (
                    <span className="mt-2 block text-[10px] text-muted-foreground text-left">
                        {timestamp}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
