/**
 * API Service
 * Centralized API calls for the frontend
 */

import type { Message } from "@/components/chat/types";

// ============================================
// Types
// ============================================

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ChatResponse {
  content: string;
  type: string;
  data?: unknown;
  conversationId?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

// ============================================
// API Base Configuration
// ============================================

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || error.message || "API request failed");
  }
  return response.json();
}

// ============================================
// Conversations API
// ============================================

/**
 * Get all conversations for a user
 * Client-side caching is handled in useConversations hook
 */
export async function getConversations(userId?: string): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  
  const response = await fetch(`${API_BASE}/conversations?${params}`, {
    cache: "no-store", // Always fetch fresh data, caching handled in hook
  });
  return handleResponse<Conversation[]>(response);
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(id: string): Promise<ConversationWithMessages> {
  const response = await fetch(`${API_BASE}/conversations/${id}`);
  return handleResponse<ConversationWithMessages>(response);
}

/**
 * Create a new conversation
 */
export async function createConversation(title: string, userId?: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, userId }),
  });
  return handleResponse<Conversation>(response);
}

/**
 * Update a conversation
 */
export async function updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Conversation>(response);
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/conversations/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ success: boolean }>(response);
}

// ============================================
// Chat API
// ============================================

export interface ChatRequest {
  message: string;
  model?: "standard" | "pro";
  conversationId?: string | null;
}

/**
 * Send a chat message
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<ChatResponse>(response);
}

// ============================================
// Process API (Full-featured)
// ============================================

export interface ProcessRequest {
  userId: string;
  message: string;
  conversationId?: string;
  channel?: "web" | "whatsapp";
  model?: "standard" | "pro";
  userPlan?: "free" | "paid";
  metadata?: Record<string, unknown>;
}

/**
 * Process a message with full features
 */
export async function processMessage(request: ProcessRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<ChatResponse>(response);
}

// ============================================
// SSE Events
// ============================================

export interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

/**
 * Subscribe to SSE events
 */
export function subscribeToEvents(
  userId: string,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/events?userId=${userId}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (error) {
      console.error("Error parsing SSE event:", error);
    }
  };

  eventSource.addEventListener("connected", (event) => {
    console.log("SSE connected:", (event as MessageEvent).data);
  });

  eventSource.addEventListener("heartbeat", () => {
    // Heartbeat received, connection is alive
  });

  eventSource.addEventListener("task_complete", (event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data);
      onEvent({ type: "task_complete", data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error parsing task_complete event:", error);
    }
  });

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    onError?.(new Error("SSE connection error"));
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Group conversations by date
 */
export function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups = {
    today: [] as Conversation[],
    yesterday: [] as Conversation[],
    lastWeek: [] as Conversation[],
    older: [] as Conversation[],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.updatedAt);
    
    if (convDate >= today) {
      groups.today.push(conv);
    } else if (convDate >= yesterday) {
      groups.yesterday.push(conv);
    } else if (convDate >= lastWeek) {
      groups.lastWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  
  return date.toLocaleDateString("ar-SA");
}

