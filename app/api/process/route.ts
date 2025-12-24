/**
 * Main Process API Endpoint
 * Handles all chat processing with AI agent
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataService, initializeDataService } from "@/lib/data";
import { invokeAgent } from "@/services/agent";
import { formatResponse } from "@/services/agent/reply-manager";
import type { Channel, UserPlan } from "@/types";

// ============================================
// Request Validation Schema
// ============================================

const processRequestSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  message: z.string().min(1, "message is required"),
  conversationId: z.string().optional(),
  channel: z.enum(["web", "whatsapp"]).optional().default("web"),
  model: z.enum(["standard", "pro"]).optional().default("standard"),
  userPlan: z.enum(["free", "paid"]).optional(),
  // Fix: z.record takes a key type and a value type, key must be string|number|symbol; so use z.string() as key
  metadata: z.record(z.string(), z.unknown()).optional(),
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
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();

    // Validate request (fix: report proper error property and use correct safeParse error type)
    const validationResult = processRequestSchema.safeParse(body);
    if (!validationResult.success) {
      // zod's error is validationResult.error, errors property is .issues
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, message, conversationId, channel, model, userPlan, metadata } =
      validationResult.data;

    const dataService = getDataService();

    // Check rate limit
    const isAllowed = await dataService.checkRateLimit(userId);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: 1000,
        },
        { status: 429 }
      );
    }

    // Record the request
    await dataService.recordRequest(userId);

    // Get or create user
    let user = await dataService.getUserByEmail(userId);
    if (!user) {
      user = await dataService.getUser(userId);
    }

    // Determine user plan
    const effectivePlan: UserPlan = userPlan || user?.plan || "free";

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const conversation = await dataService.createConversation({
        userId,
        title: message.substring(0, 50),
      });
      currentConversationId = conversation.id;
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
      userPlan: effectivePlan,
      conversationId: currentConversationId,
      preferredModel: model === "pro" ? "pro" : "standard",
    });

    // Save AI response
    await dataService.addMessage({
      conversationId: currentConversationId,
      content: agentResponse.content,
      isAi: true,
      type: agentResponse.type,
      data: agentResponse.data,
    });

    // Format response for channel
    const formattedResponse = formatResponse(
      channel as Channel,
      agentResponse.content,
      agentResponse.type,
      agentResponse.data,
      {
        conversationId: currentConversationId,
        toolsUsed: agentResponse.toolsUsed,
        modelUsed: agentResponse.modelUsed,
      }
    );

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Process API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONS Handler (CORS)
// ============================================

export async function OPTIONS() {
  // Fix: respond with a body (null) and a valid status
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

