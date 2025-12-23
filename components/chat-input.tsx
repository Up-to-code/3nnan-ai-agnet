"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Send, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    model: "standard" | "pro";
    onModelChange: (model: "standard" | "pro") => void;
}

export function ChatInput({ onSend, disabled, model, onModelChange }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-[env(safe-area-inset-bottom,20px)]">
            <div className="relative flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-lg border border-border/50">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك..."
                    className="min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent text-right focus-visible:ring-0 placeholder:text-muted-foreground"
                    dir="rtl"
                    disabled={disabled}
                />
                <div className="flex items-center justify-between">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                                {model === "pro" ? "عنان برو ✨" : "عنان"}
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[120px]">
                            <DropdownMenuItem
                                onClick={() => onModelChange("standard")}
                                className={cn(model === "standard" && "bg-accent")}
                            >
                                عنان
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onModelChange("pro")}
                                className={cn(model === "pro" && "bg-accent")}
                            >
                                عنان برو ✨
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || disabled}
                        size="icon"
                        className="rounded-full h-9 w-9"
                    >
                        {disabled ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
                Anan can make mistakes. Please verify important information
            </p>
        </div>
    );
}
