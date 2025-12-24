/**
 * Single Conversation API Endpoint
 * Operations on a specific conversation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataService, initializeDataService } from "@/lib/data";

// ============================================
// Request Validation Schemas
// ============================================

const updateConversationSchema = z.object({
  title: z.string().optional(),
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
// GET Handler - Get Conversation with Messages
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();

    const { id } = await params;
    const dataService = getDataService();

    // Get conversation
    const conversation = await dataService.getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await dataService.getMessages(id);

    // Format for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isAi: msg.isAi,
      timestamp: msg.timestamp,
      type: msg.type,
      data: msg.data,
    }));

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      messages: formattedMessages,
      updatedAt: conversation.updatedAt.toISOString(),
      createdAt: conversation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH Handler - Update Conversation
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();

    const { id } = await params;
    const body = await request.json();

    // Validate request
    const validationResult = updateConversationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const dataService = getDataService();

    // Check if conversation exists
    const existing = await dataService.getConversation(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Update conversation
    const updated = await dataService.updateConversation(id, validationResult.data);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE Handler - Delete Conversation
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();

    const { id } = await params;
    const dataService = getDataService();

    const deleted = await dataService.deleteConversation(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
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
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

