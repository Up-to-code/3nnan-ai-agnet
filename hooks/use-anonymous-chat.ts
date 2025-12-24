"use client";

/**
 * useAnonymousChat Hook
 * Tracks anonymous user message count and limits
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "anan_anonymous_messages";
const MAX_ANONYMOUS_MESSAGES = 10;

export interface UseAnonymousChatReturn {
  messageCount: number;
  remainingMessages: number;
  hasReachedLimit: boolean;
  canSendMessage: boolean;
  incrementCount: () => void;
  resetCount: () => void;
}

export function useAnonymousChat(): UseAnonymousChatReturn {
  const [messageCount, setMessageCount] = useState(0);

  // Load count from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Check if count is from today
          const today = new Date().toDateString();
          if (data.date === today) {
            setMessageCount(data.count);
          } else {
            // Reset if it's a new day
            localStorage.removeItem(STORAGE_KEY);
            setMessageCount(0);
          }
        } catch {
          setMessageCount(0);
        }
      }
    }
  }, []);

  // Increment message count
  const incrementCount = useCallback(() => {
    setMessageCount((prev) => {
      const newCount = prev + 1;
      
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            count: newCount,
            date: new Date().toDateString(),
          })
        );
      }
      
      return newCount;
    });
  }, []);

  // Reset count (called after user logs in)
  const resetCount = useCallback(() => {
    setMessageCount(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const remainingMessages = Math.max(0, MAX_ANONYMOUS_MESSAGES - messageCount);
  const hasReachedLimit = messageCount >= MAX_ANONYMOUS_MESSAGES;
  const canSendMessage = !hasReachedLimit;

  return {
    messageCount,
    remainingMessages,
    hasReachedLimit,
    canSendMessage,
    incrementCount,
    resetCount,
  };
}

export default useAnonymousChat;

