/**
 * Better Auth API Route Handler
 * Handles all authentication API endpoints with error handling
 */

import { auth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// Handler Setup
// ============================================

const handler = toNextJsHandler(auth);

// ============================================
// Error Messages (Arabic)
// ============================================

const ERROR_MESSAGES = {
  database: "خدمة قاعدة البيانات غير متاحة حالياً. يرجى المحاولة لاحقاً.",
  server: "حدث خطأ في الخادم. يرجى المحاولة لاحقاً.",
} as const;

// ============================================
// MongoDB Error Detection
// ============================================

function isMongoDBError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  
  const err = error as Record<string, unknown>;
  const errorName = String(err.name || "").toLowerCase();
  const errorMessage = String(err.message || "").toLowerCase();
  
  const mongoErrorPatterns = [
    "mongoservererror",
    "mongotopologyclosederror",
    "mongonetworkerror",
    "mongoerror",
    "authentication failed",
    "bad auth",
    "topology is closed",
    "connection closed",
    "atlaserror",
  ];
  
  return (
    err.code === 8000 ||
    err.codeName === "AtlasError" ||
    mongoErrorPatterns.some(pattern => 
      errorName.includes(pattern) || errorMessage.includes(pattern)
    )
  );
}

function checkResponseForMongoError(text: string): boolean {
  const lowerText = text.toLowerCase();
  const patterns = [
    "authentication failed",
    "atlaserror",
    "bad auth",
    "code: 8000",
    "mongoservererror",
    "topology is closed",
    "mongotopologyclosederror",
  ];
  return patterns.some(pattern => lowerText.includes(pattern));
}

// ============================================
// Request Handler with Error Catching
// ============================================

async function handleRequest(
  req: NextRequest,
  handlerFn: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  try {
    const response = await handlerFn(req);
    
    // Check for server errors
    if (response.status === 500) {
      // Try to detect MongoDB errors in response
      try {
        const text = await response.clone().text();
        if (checkResponseForMongoError(text)) {
          console.error("[Auth] MongoDB error detected in response");
          return createErrorResponse(ERROR_MESSAGES.database, 503);
        }
      } catch {
        // If we can't read response, check if MongoDB is configured
      }
      
      // If MongoDB is configured and we get 500, assume database issue
      if (process.env.USE_MONGODB === "true" && process.env.MONGODB_URI) {
        console.error("[Auth] 500 error with MongoDB configured - assuming database issue");
        return createErrorResponse(ERROR_MESSAGES.database, 503);
      }
    }
    
    return response;
  } catch (error: unknown) {
    console.error("[Auth] Request error:", error);
    
    if (isMongoDBError(error)) {
      console.error("[Auth] MongoDB error caught");
      return createErrorResponse(ERROR_MESSAGES.database, 503);
    }
    
    return createErrorResponse(ERROR_MESSAGES.server, 500);
  }
}

// ============================================
// Error Response Helper
// ============================================

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: { message } },
    { status }
  );
}

// ============================================
// Route Handlers
// ============================================

export async function GET(req: NextRequest) {
  return handleRequest(req, handler.GET);
}

export async function POST(req: NextRequest) {
  return handleRequest(req, handler.POST);
}
