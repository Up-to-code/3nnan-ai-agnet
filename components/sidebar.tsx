"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { theme, setTheme } = useTheme();
    const [sheetOpen, setSheetOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4 p-4">
            <Button className="w-full gap-2">
                <Plus className="h-4 w-4" /> محادثة جديدة
            </Button>
            <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="بحث في المحادثات..."
                    className="pr-9 border-0 bg-secondary/50 focus-visible:ring-0"
                    dir="rtl"
                />
            </div>
            <Separator />
            <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mb-2 px-2">اليوم</p>
                    <button className="w-full rounded-lg bg-primary/10 p-3 text-right text-sm font-medium hover:bg-primary/20 transition-colors">
                        تحليل السوق العقاري
                    </button>
                    <button className="w-full rounded-lg p-3 text-right text-sm hover:bg-secondary/50 transition-colors">
                        استشارة قانونية
                    </button>
                    <p className="text-xs text-muted-foreground mb-2 mt-4 px-2">الشهر الماضي</p>
                    <button className="w-full rounded-lg p-3 text-right text-sm hover:bg-secondary/50 transition-colors">
                        مشروع شمال الرياض
                    </button>
                    <button className="w-full rounded-lg p-3 text-right text-sm hover:bg-secondary/50 transition-colors">
                        فلل للبيع في جدة
                    </button>
                </div>
            </ScrollArea>
            <Separator />
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <span className="text-xs text-muted-foreground">أحمد منصور</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn("hidden lg:flex w-[280px] flex-col border-l bg-card")}>
                <SidebarContent />
            </aside>

            {/* Mobile Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild className="lg:hidden fixed top-4 right-4 z-50">
                    <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] max-w-[320px] p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
