"use client";

import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Settings, MessageSquare, Trash2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConversations } from "@/hooks/use-conversations";
import { useAuth } from "@/hooks/use-auth";
import type { Conversation } from "@/lib/api";
import { SidebarSkeleton } from "./sidebar-skeleton";
import { emitEvent, EVENTS } from "@/lib/events";

// ============================================
// Types
// ============================================

interface SidebarProps {
  className?: string;
}

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  isActive: (id: string) => boolean;
  onConversationClick: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

// ============================================
// Helper Components
// ============================================

const ConversationItem = memo(function ConversationItem({ conv, isActive, onClick, onDelete }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg p-3 text-right text-sm transition-colors hover:bg-accent text-foreground/90 group flex items-start gap-3 relative",
        isActive && "bg-accent"
      )}
    >
      <span className="truncate flex-1">{conv.title}</span>
      <div
        onClick={onDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-2 flex items-center justify-center rounded-md hover:bg-destructive/10 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="حذف المحادثة"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDelete(e as unknown as React.MouseEvent);
          }
        }}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </div>
    </button>
  );
});

const ConversationGroup = memo(function ConversationGroup({ title, conversations, isActive, onConversationClick, onDelete }: ConversationGroupProps) {
  if (conversations.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">{title}</h3>
      {conversations.map((conv, index) => (
        <ConversationItem
          key={conv.id ?? `${title}-${index}`}
          conv={conv}
          isActive={isActive(conv.id)}
          onClick={() => onConversationClick(conv.id)}
          onDelete={(e) => onDelete(e, conv.id)}
        />
      ))}
    </div>
  );
});

// ============================================
// Sidebar Component
// ============================================

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  const {
    conversations,
    groupedConversations,
    isLoading,
    error,
    remove,
    refresh,
  } = useConversations({
    userId: user?.id,
    autoFetch: true,
  });

  // Refresh conversations when pathname changes (new conversation created)
  useEffect(() => {
    if (pathname?.startsWith("/chat/") && pathname !== "/chat/new") {
      // Small delay to ensure API has updated
      const timer = setTimeout(() => {
        refresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, refresh]);

  // Filter conversations by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedConversations;
    }

    const query = searchQuery.toLowerCase();
    const filterFn = (conv: Conversation) =>
      conv.title.toLowerCase().includes(query) || conv.lastMessage?.toLowerCase().includes(query);

    return {
      today: groupedConversations.today.filter(filterFn),
      yesterday: groupedConversations.yesterday.filter(filterFn),
      lastWeek: groupedConversations.lastWeek.filter(filterFn),
      older: groupedConversations.older.filter(filterFn),
    };
  }, [groupedConversations, searchQuery]);

  const handleNewChat = useCallback(() => {
    router.push("/chat/new");
  }, [router]);

  const handleConversationClick = useCallback((id: string) => {
    router.push(`/chat/${id}`);
  }, [router]);

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (conversationToDelete) {
      const success = await remove(conversationToDelete);
      
      if (success) {
        // Emit event to clear chat interface
        emitEvent(EVENTS.CONVERSATION_DELETED, { id: conversationToDelete });
        
        // Redirect to new conversation
        router.push("/chat/new");
      }
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  }, [conversationToDelete, remove, router]);

  const currentConversationId = useMemo(() => 
    pathname?.startsWith("/chat/") ? pathname.split("/chat/")[1] : null
  , [pathname]);

  const isActive = useCallback((id: string) => currentConversationId === id, [currentConversationId]);

  return (
    <aside
      className={cn("hidden lg:flex w-[280px] flex-col border-l border-border bg-card h-full", className)}
      dir="rtl"
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-2 h-16 px-4 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <MessageSquare className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">عنان AI</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-4 gap-4 min-h-0">
        {/* New Chat Button */}
        <Button
          onClick={handleNewChat}
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20 transition-all h-11 rounded-xl justify-start shrink-0"
          variant="default"
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span>محادثة جديدة</span>
        </Button>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المحادثات..."
            className="h-10 w-full rounded-xl bg-muted/50 border-transparent focus:bg-muted focus-visible:ring-1 focus-visible:ring-border pr-9 text-sm"
          />
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 min-h-0 -mx-2 px-2">
          {isLoading ? (
            <SidebarSkeleton />
          ) : error ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <p>حدث خطأ في تحميل المحادثات</p>
              <Button variant="link" size="sm" onClick={refresh}>
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
            <div className="space-y-6 pb-4">
              <ConversationGroup
                title="اليوم"
                conversations={filteredGroups.today}
                isActive={isActive}
                onConversationClick={handleConversationClick}
                onDelete={handleDeleteClick}
              />
              <ConversationGroup
                title="أمس"
                conversations={filteredGroups.yesterday}
                isActive={isActive}
                onConversationClick={handleConversationClick}
                onDelete={handleDeleteClick}
              />
              <ConversationGroup
                title="هذا الأسبوع"
                conversations={filteredGroups.lastWeek}
                isActive={isActive}
                onConversationClick={handleConversationClick}
                onDelete={handleDeleteClick}
              />
              <ConversationGroup
                title="أقدم"
                conversations={filteredGroups.older}
                isActive={isActive}
                onConversationClick={handleConversationClick}
                onDelete={handleDeleteClick}
              />

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

        <Separator className="bg-border/50" />

        {/* User Profile & Settings */}
        <div className="pt-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer group">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{user.name?.slice(0, 2) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 text-right overflow-hidden">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
              <Settings className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => router.push("/auth/login")}>
              تسجيل الدخول
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border border-border bg-card shadow-xl" dir="rtl">
          <DialogHeader className="p-6 pb-2">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-bold">حذف المحادثة</DialogTitle>
            </div>
            <DialogDescription className="text-center text-muted-foreground mt-2">
              هل أنت متأكد من حذف هذه المحادثة؟ 
              <br />
              لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الرسائل.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 pt-2 gap-3 sm:gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConversationToDelete(null);
              }}
              className="flex-1 h-10 rounded-xl hover:bg-accent hover:text-accent-foreground border-border/50"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1 h-10 rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90"
            >
              حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
