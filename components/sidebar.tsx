"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Menu, Sun, Moon, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useMemo } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { formatRelativeTime } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onNewChat?: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
    const { theme, setTheme } = useTheme();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    const {
        conversations,
        groupedConversations,
        isLoading,
        error,
        remove,
    } = useConversations();

    // Filter conversations by search query
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) {
            return groupedConversations;
        }

        const query = searchQuery.toLowerCase();
        const filterFn = (conv: typeof conversations[0]) =>
            conv.title.toLowerCase().includes(query) ||
            conv.lastMessage?.toLowerCase().includes(query);

        return {
            today: groupedConversations.today.filter(filterFn),
            yesterday: groupedConversations.yesterday.filter(filterFn),
            lastWeek: groupedConversations.lastWeek.filter(filterFn),
            older: groupedConversations.older.filter(filterFn),
        };
    }, [groupedConversations, searchQuery]);

    // Get current conversation ID from pathname
    const currentConversationId = pathname?.startsWith("/chat/")
        ? pathname.split("/chat/")[1]
        : null;

    const handleNewChat = () => {
        if (onNewChat) {
            onNewChat();
        } else {
            router.push("/chat/new");
        }
        setSheetOpen(false);
    };

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const confirmed = window.confirm("هل تريد حذف هذه المحادثة؟");
        if (confirmed) {
            const success = await remove(id);
            if (success && currentConversationId === id) {
                router.push("/chat/new");
            }
        }
    };

    const ConversationItem = ({ conv, isActive }: { conv: typeof conversations[0]; isActive: boolean }) => (
        <Link
            href={`/chat/${conv.id}`}
            className={cn(
                "group w-full rounded-lg p-3 text-right text-sm transition-colors flex items-start gap-2 relative",
                isActive
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-secondary/50"
            )}
            onClick={() => setSheetOpen(false)}
        >
            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
                <p className="truncate">{conv.title}</p>
                {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                    </p>
                )}
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-2"
                onClick={(e) => handleDeleteConversation(e, conv.id)}
            >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
        </Link>
    );

    const ConversationGroup = ({ title, conversations: convs }: { title: string; conversations: typeof conversations }) => {
        if (convs.length === 0) return null;

        return (
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground mb-2 px-2">{title}</p>
                {convs.map((conv) => (
                    <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={currentConversationId === conv.id}
                    />
                ))}
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4 p-4">
            <Button className="w-full gap-2" onClick={handleNewChat}>
                <Plus className="h-4 w-4" /> محادثة جديدة
            </Button>
            
            <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="بحث في المحادثات..."
                    className="pr-9 border-0 bg-secondary/50 focus-visible:ring-0"
                    dir="rtl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <Separator />
            
            <ScrollArea className="flex-1 -mr-4 pr-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        <p>حدث خطأ في تحميل المحادثات</p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            إعادة المحاولة
                        </Button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>لا توجد محادثات بعد</p>
                        <p className="text-xs mt-1">ابدأ محادثة جديدة للبدء</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ConversationGroup title="اليوم" conversations={filteredGroups.today} />
                        <ConversationGroup title="أمس" conversations={filteredGroups.yesterday} />
                        <ConversationGroup title="هذا الأسبوع" conversations={filteredGroups.lastWeek} />
                        <ConversationGroup title="أقدم" conversations={filteredGroups.older} />
                        
                        {searchQuery && 
                         filteredGroups.today.length === 0 && 
                         filteredGroups.yesterday.length === 0 &&
                         filteredGroups.lastWeek.length === 0 &&
                         filteredGroups.older.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                <p>لا توجد نتائج للبحث</p>
                            </div>
                        )}
                    </div>
                )}
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
                <span className="text-xs text-muted-foreground">عنان AI</span>
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
