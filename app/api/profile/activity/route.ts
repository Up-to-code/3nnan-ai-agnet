/**
 * Activity History API Endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDataService, initializeDataService } from "@/lib/data";

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
// GET Handler - Get Activity History
// ============================================

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataService = getDataService();
    let user = await dataService.getUser(session.user.id);

    // If user doesn't exist in application collection, try to find by email
    if (!user) {
      user = await dataService.getUserByEmail(session.user.email || "");
    }

    // If still not found, create user from session data
    if (!user) {
      try {
        user = await dataService.createUser({
          email: session.user.email || "",
          name: session.user.name || "User",
          plan: "free",
        });
      } catch (createError) {
        // If creation fails (e.g., duplicate email), try to fetch again
        console.error("Error creating user, attempting to fetch by email:", createError);
        user = await dataService.getUserByEmail(session.user.email || "");
        
        if (!user) {
          return NextResponse.json(
            { error: "User not found and could not be created" },
            { status: 500 }
          );
        }
      }
    }

    // Return login history (last 20 entries)
    const history = (user.loginHistory || []).slice(-20).map((entry) => ({
      timestamp: entry.timestamp instanceof Date 
        ? entry.timestamp.toISOString() 
        : new Date(entry.timestamp).toISOString(),
      ip: entry.ip || "Unknown",
      userAgent: entry.userAgent || "Unknown",
      device: entry.device || "Unknown",
    }));

    const response = NextResponse.json({
      history,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    });
    
    // Add cache headers (30 seconds)
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    
    return response;
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity history" },
      { status: 500 }
    );
  }
}


