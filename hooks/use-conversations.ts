"use client";

/**
 * useConversations Hook
 * Manages conversations state and API calls with caching
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  groupConversationsByDate,
  type Conversation,
  type ConversationWithMessages,
} from "@/lib/api";

// In-memory cache for conversations
const conversationsCache = new Map<string, { data: Conversation[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export interface UseConversationsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  groupedConversations: ReturnType<typeof groupConversationsByDate>;
  isLoading: boolean;
  error: string | null;
  selectedConversation: ConversationWithMessages | null;
  
  // Actions
  refresh: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNew: (title: string) => Promise<Conversation | null>;
  remove: (id: string) => Promise<boolean>;
  clearSelection: () => void;
}

export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsReturn {
  const { userId, autoFetch = true } = options;
  const cacheKey = userId || "default-user";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Fetch all conversations with caching
  const refresh = useCallback(async (force = false) => {
    // Check cache first
    const cached = conversationsCache.get(cacheKey);
    const now = Date.now();
    
    if (!force && cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Use cached data
      setConversations(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getConversations(userId);
      const conversationsList = data || [];
      
      // Update cache
      conversationsCache.set(cacheKey, {
        data: conversationsList,
        timestamp: now,
      });
      
      setConversations(conversationsList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load conversations";
      setError(message);
      setConversations([]); // Default to empty array on error
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, cacheKey]);

  // Select and load a conversation
  const selectConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getConversation(id);
      setSelectedConversation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load conversation";
      setError(message);
      console.error("Error fetching conversation:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new conversation
  const createNew = useCallback(async (title: string): Promise<Conversation | null> => {
    try {
      const conversation = await createConversation(title, userId);
      // Add to the beginning of the list
      setConversations((prev) => [conversation, ...prev]);
      
      // Invalidate cache
      conversationsCache.delete(cacheKey);
      
      return conversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      return null;
    }
  }, [userId, cacheKey]);

  // Delete a conversation
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      
      // Invalidate cache
      conversationsCache.delete(cacheKey);
      
      // Clear selection if deleted conversation was selected
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting conversation:", err);
      return false;
    }
  }, [selectedConversation, cacheKey]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  // Auto-fetch on mount (use cache if available)
  useEffect(() => {
    if (autoFetch) {
      // On initial mount, try cache first, then refresh if needed
      if (isInitialMount.current) {
        isInitialMount.current = false;
        const cached = conversationsCache.get(cacheKey);
        if (cached) {
          setConversations(cached.data);
          // Refresh in background
          refresh(true);
        } else {
          refresh(false);
        }
      } else {
        refresh(false);
      }
    }
  }, [autoFetch, refresh, cacheKey]);

  // Group conversations by date
  const groupedConversations = groupConversationsByDate(conversations);

  return {
    conversations,
    groupedConversations,
    isLoading,
    error,
    selectedConversation,
    refresh,
    selectConversation,
    createNew,
    remove,
    clearSelection,
  };
}

export default useConversations;

