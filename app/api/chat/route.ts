/**
 * Chat API Endpoint
 * Simplified chat endpoint for frontend integration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
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

    // Get authenticated user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dataService = getDataService();
    const userId = session.user.id;

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

    // Get or ensure user exists
    let user = await dataService.getUser(userId);
    if (!user) {
      user = await dataService.getUserByEmail(session.user.email || "");
    }
    if (!user) {
      user = await dataService.createUser({
        email: session.user.email || "",
        name: session.user.name || "User",
        plan: model === "pro" ? "paid" : "free",
      });
    }

    // Invoke AI agent
    const agentResponse = await invokeAgent(message, {
      userId,
      userPlan: user.plan,
      conversationId: currentConversationId,
    });

    // Track token usage (atomic increment to prevent race conditions)
    // Use user.id (MongoDB ID) instead of userId (better-auth ID) for database operations
    const tokensUsed = agentResponse.tokensUsed || 0;
    
    // Validation: Log when tokens are 0 to identify extraction issues
    if (tokensUsed === 0) {
      console.warn(`[Chat API] WARNING: tokensUsed is 0 for user ${user.id}`);
      console.warn(`[Chat API] Agent response structure:`, {
        hasTokensUsed: 'tokensUsed' in agentResponse,
        tokensUsedValue: agentResponse.tokensUsed,
        agentResponseKeys: Object.keys(agentResponse),
        modelUsed: agentResponse.modelUsed,
        contentLength: agentResponse.content?.length || 0,
      });
      console.warn(`[Chat API] This indicates tokens were not extracted from the API response. Check agent service logs.`);
    }
    
    if (tokensUsed > 0) {
      console.log(`[Chat API] Tracking ${tokensUsed} tokens for user ${user.id} (better-auth ID: ${userId})`);
      const updatedUser = await dataService.incrementUserTokens(user.id, tokensUsed);
      if (updatedUser) {
        const newTotal = (updatedUser.metadata?.tokensUsed as number) || 0;
        console.log(`[Chat API] User ${user.id} tokens updated: ${newTotal} total`);
      } else {
        console.error(`[Chat API] Failed to update tokens for user ${user.id}`);
        console.error(`[Chat API] This indicates a database save issue. Check MongoDB logs.`);
      }
    } else {
      console.log(`[Chat API] No tokens to track (tokensUsed: ${tokensUsed})`);
    }

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

