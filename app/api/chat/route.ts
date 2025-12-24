/**
 * Chat API Endpoint
 * Simplified chat endpoint for frontend integration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataService, initializeDataService } from "@/lib/data";
import { invokeAgent } from "@/services/agent";
import type { MessageType } from "@/types";

// ============================================
// Request Validation Schema
// ============================================

const chatRequestSchema = z.object({
  message: z.string().min(1, "message is required"),
  model: z.enum(["standard", "pro"]).optional().default("standard"),
  conversationId: z.string().optional().nullable(),
});

// ============================================
// Initialize Data Service
// ============================================

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeDataService();
    initialized = true;
  }
}

// ============================================
// Response Interface
// ============================================

export interface ChatResponse {
  content: string;
  type: MessageType;
  data?: unknown;
  conversationId?: string;
}

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { message, model, conversationId } = validationResult.data;

    const dataService = getDataService();

    // Use a default user ID for now (in production, get from auth)
    const userId = "default-user";

    // Check rate limit
    const isAllowed = await dataService.checkRateLimit(userId);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "الرجاء الانتظار قليلاً قبل إرسال رسالة أخرى",
        },
        { status: 429 }
      );
    }

    await dataService.recordRequest(userId);

    // Get or create conversation
    let currentConversationId = conversationId || undefined;
    if (!currentConversationId) {
      const conversation = await dataService.createConversation({
        userId,
        title: message.substring(0, 50),
      });
      if (!conversation.id) {
        throw new Error("Failed to create conversation - no ID returned");
      }
      currentConversationId = conversation.id;
    }

    // Validate conversationId before using it
    if (!currentConversationId || currentConversationId === "undefined") {
      throw new Error("Invalid conversation ID");
    }

    // Save user message
    await dataService.addMessage({
      conversationId: currentConversationId,
      content: message,
      isAi: false,
      type: "text",
    });

    // Invoke AI agent
    const agentResponse = await invokeAgent(message, {
      userId,
      userPlan: model === "pro" ? "paid" : "free",
      conversationId: currentConversationId,
    });

    // Save AI response
    await dataService.addMessage({
      conversationId: currentConversationId,
      content: agentResponse.content,
      isAi: true,
      type: agentResponse.type,
      data: agentResponse.data,
    });

    // Return response matching frontend expectations
    const response: ChatResponse = {
      content: agentResponse.content,
      type: agentResponse.type,
      conversationId: currentConversationId,
    };

    // Add data if present
    if (agentResponse.data) {
      response.data = agentResponse.data;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        content: "عذراً، حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.",
        type: "text",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONS Handler (CORS)
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

