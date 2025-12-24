/**
 * Conversations API Endpoint
 * CRUD operations for conversations
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataService, initializeDataService } from "@/lib/data";

// ============================================
// Request Validation Schemas
// ============================================

const createConversationSchema = z.object({
  title: z.string().min(1, "title is required"),
  userId: z.string().optional().default("default-user"),
});

// ============================================
// Initialize Data Service
// ============================================

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await initializeDataService();
      initialized = true;
    } catch (error) {
      console.error("Failed to initialize data service:", error);
      throw error;
    }
  }
}

// ============================================
// Cache Configuration
// ============================================

export const revalidate = 30; // Revalidate every 30 seconds

// ============================================
// GET Handler - List Conversations
// ============================================

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    const dataService = getDataService();
    const conversations = await dataService.getConversations(userId);

    // Format for frontend
    const formattedConversations = conversations.map((conv) => {
        try {
            return {
                id: conv.id,
                title: conv.title,
                lastMessage: conv.lastMessage,
                updatedAt: conv.updatedAt instanceof Date ? conv.updatedAt.toISOString() : new Date().toISOString(),
                createdAt: conv.createdAt instanceof Date ? conv.createdAt.toISOString() : new Date().toISOString(),
            };
        } catch (e) {
            console.error("Error formatting conversation:", conv.id, e);
            return {
                id: conv.id,
                title: conv.title,
                lastMessage: conv.lastMessage,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
        }
    });

    const response = NextResponse.json(formattedConversations);
    
    // Add cache headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );
    
    return response;
  } catch (error) {
    console.error("Get conversations error:", error);
    if (error instanceof Error) {
        console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch conversations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================
// POST Handler - Create Conversation
// ============================================

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();

    // Validate request
    const validationResult = createConversationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { title, userId } = validationResult.data;

    const dataService = getDataService();
    const conversation = await dataService.createConversation({
      userId,
      title,
    });

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt.toISOString(),
      createdAt: conversation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
