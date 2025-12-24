"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    model: "standard" | "pro";
    onModelChange: (model: "standard" | "pro") => void;
    onHeightChange?: (height: number) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({ onSend, isLoading, model, onModelChange, onHeightChange, disabled, placeholder }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Monitor height change - measure the inner container that includes all padding
    const innerContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const containerToMeasure = innerContainerRef.current || containerRef.current;
        if (!containerToMeasure || !onHeightChange) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                // Use borderBoxSize for precise outer height including all padding and borders
                const height = entry.borderBoxSize?.[0]?.blockSize ?? containerToMeasure.clientHeight ?? 0;
                onHeightChange(height);
            }
        });

        observer.observe(containerToMeasure);
        // Initial check
        onHeightChange(containerToMeasure.clientHeight);

        return () => observer.disconnect();
    }, [onHeightChange]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Auto-focus on mount (desktop only)
    useEffect(() => {
        if (textareaRef.current && window.innerWidth >= 768) {
            // Small delay to ensure component is mounted
            const timer = setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    // Handle Mobile Keyboard opening/closing
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                const height = window.innerHeight - window.visualViewport.height;
                setKeyboardHeight(height > 0 ? height : 0);
            }
        };

        window.visualViewport?.addEventListener("resize", handleResize);
        // Also listen to scroll because some mobile browsers trigger scroll when keyboard opens
        window.visualViewport?.addEventListener("scroll", handleResize);

        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
            window.visualViewport?.removeEventListener("scroll", handleResize);
        };
    }, []);

    const handleSubmit = () => {
        if (input.trim() && !isLoading && !disabled) {
            onSend(input.trim());
            setInput("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full px-4 transition-all duration-300"
            style={{ 
                transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
                marginBottom: keyboardHeight > 100 ? `${Math.max(keyboardHeight - 20, 0)}px` : '0px',
                transform: keyboardHeight > 100 ? `translateY(-${Math.min(keyboardHeight * 0.1, 20)}px)` : 'translateY(0)'
            }}
        >
            <div 
                ref={innerContainerRef}
                className="relative flex flex-col gap-3 rounded-3xl bg-card/80 backdrop-blur-xl p-3.5 border border-border/50 shadow-2xl shadow-primary/5 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-primary/10"
            >

                {/* Text Input Area */}
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                    placeholder={placeholder || "اكتب رسالتك هنا..."}
                    disabled={disabled}
                    className={cn(
                        "min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent text-right focus-visible:ring-0 shadow-none px-1 text-[16px] sm:text-base placeholder:text-muted-foreground/40 leading-relaxed transition-all duration-300",
                        disabled && "cursor-not-allowed opacity-60"
                    )}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
                    dir="rtl"
                    rows={1}
                />

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between gap-3" dir="rtl">

                    {/* Right Side: Model Selector */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "gap-1.5 h-9 px-3 rounded-xl font-medium transition-colors",
                                        model === "pro"
                                            ? "text-primary/90 bg-primary/5 hover:bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    {model === "pro" && <Sparkles className="h-3.5 w-3.5 fill-primary text-primary" />}
                                    <span className="text-xs sm:text-sm">{model === "pro" ? "عنان بلس" : "عنان"}</span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            {/* side="top" ensures menu opens UP, away from the keyboard */}
                            <DropdownMenuContent side="top" align="start" className="bg-popover border-border shadow-xl min-w-[140px] mb-2">
                                <DropdownMenuItem onClick={() => onModelChange("standard")} className="justify-between text-sm">
                                    عنان {model === "standard" && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onModelChange("pro")} className="justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        عنان بلس
                                    </div>
                                    {model === "pro" && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Left Side: Send Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading || disabled}
                        size="icon"
                        className={cn(
                            "rounded-xl h-9 w-9 transition-all duration-300 shrink-0",
                            input.trim() && !disabled
                                ? "bg-primary text-white hover:bg-primary/90 scale-100 shadow-lg shadow-primary/25"
                                : "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted scale-90 shadow-none"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowUp className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}