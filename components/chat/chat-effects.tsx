"use client";

import { motion } from "framer-motion";

export function WritingEffect() {
    return (
        <div dir="rtl" className="flex items-center gap-2">
            {/* 1. Text: Now on the Right (Start) - Matches alignment with Avatar */}
            <span className="text-xs text-foreground/70 font-medium">يكتب...</span>

            {/* 2. Dots: Now on the Left (End) - Standard Arabic ellipsis position */}
            <div className="flex gap-1.5 items-center">
                <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full" 
                    animate={{ y: [0, -4, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0, ease: "easeInOut" }} 
                />
                <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full" 
                    animate={{ y: [0, -4, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1, ease: "easeInOut" }} 
                />
                <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full" 
                    animate={{ y: [0, -4, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }} 
                />
            </div>
        </div>
    );
}

export function SearchingEffect() {
    return (
        <div dir="rtl" className="flex items-center gap-3 w-fit px-4 py-2.5 rounded-xl bg-muted/20 border border-border/50 backdrop-blur-sm">
            <div className="relative w-4 h-4">
                <div className="absolute inset-0 rounded-full border-2 border-border" />
                <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-primary animate-spin" />
            </div>
            <span className="text-xs font-medium text-foreground/90">
                جاري البحث في المصادر...
            </span>
        </div>
    );
}