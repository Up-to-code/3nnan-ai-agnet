/**
 * Server-Sent Events (SSE) Endpoint
 * Real-time updates for pending tasks and messages
 */

import { NextRequest, NextResponse } from "next/server";
import { getDataService, initializeDataService } from "@/lib/data";

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
// GET Handler - SSE Stream
// ============================================

export async function GET(request: NextRequest) {
  await ensureInitialized();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isActive = true;

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        if (!isActive) return;

        const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({
          timestamp: new Date().toISOString(),
        })}\n\n`;

        try {
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          isActive = false;
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Poll for pending tasks every 2 seconds
      const pollInterval = setInterval(async () => {
        if (!isActive) return;

        try {
          const dataService = getDataService();
          const tasks = await dataService.getPendingTasks(userId);

          // Check for completed tasks
          for (const task of tasks) {
            if (task.status === "completed") {
              const event = `event: task_complete\ndata: ${JSON.stringify({
                taskId: task.id,
                conversationId: task.conversationId,
                status: task.status,
                result: task.result,
                timestamp: new Date().toISOString(),
              })}\n\n`;

              controller.enqueue(encoder.encode(event));

              // Update task to prevent re-sending
              await dataService.updatePendingTask(task.id, {
                status: "completed",
                completedAt: new Date(),
              });
            }
          }
        } catch (error) {
          console.error("SSE poll error:", error);
        }
      }, 2000);

      // Send initial connection message
      const connected = `event: connected\ndata: ${JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(connected));

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        isActive = false;
        clearInterval(heartbeatInterval);
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ============================================
// OPTIONS Handler (CORS)
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

