/**
 * Profile API Endpoint
 * GET and PATCH operations for user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getDataService, initializeDataService } from "@/lib/data";

// ============================================
// Request Validation Schemas
// ============================================

const updateProfileSchema = z.object({
  name: z.string().min(1, "name is required").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
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
// GET Handler - Get User Profile
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
          { error: "Failed to create or find user profile" },
          { status: 500 }
        );
        }
      }
    }

    // Get tokens from metadata
    const tokensUsed = (user.metadata?.tokensUsed as number) || 0;
    const tokensLimit = user.plan === "paid" ? 100000 : 1000000; // Paid: 100k, Free: 1M
    
    // Enhanced logging to verify metadata structure
    console.log(`[Profile API] Retrieved tokens for user ${user.id}: ${tokensUsed}/${tokensLimit} (plan: ${user.plan})`);
    console.log(`[Profile API] Raw metadata object:`, JSON.stringify(user.metadata, null, 2));
    console.log(`[Profile API] Metadata structure:`, {
      hasMetadata: !!user.metadata,
      metadataType: typeof user.metadata,
      metadataKeys: user.metadata ? Object.keys(user.metadata) : [],
      tokensUsedType: typeof user.metadata?.tokensUsed,
      tokensUsedValue: user.metadata?.tokensUsed,
    });
    
    // Warn if tokens are 0 but we expect them to be tracked
    if (tokensUsed === 0) {
      console.warn(`[Profile API] WARNING: tokensUsed is 0 for user ${user.id}. This may indicate:`);
      console.warn(`[Profile API] 1. No tokens have been used yet (normal for new users)`);
      console.warn(`[Profile API] 2. Tokens are not being saved correctly (check chat/process API logs)`);
      console.warn(`[Profile API] 3. Metadata structure issue (check metadata object above)`);
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      phone: user.phone || "",
      location: user.location || "",
      avatar: user.avatar || "",
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      loginHistory: user.loginHistory || [],
      tokensUsed,
      tokensLimit,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH Handler - Update Profile
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    await ensureInitialized();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request
    const validationResult = updateProfileSchema.safeParse(body);
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
    
    // Ensure user exists before updating
    let user = await dataService.getUser(session.user.id);
    if (!user) {
      user = await dataService.getUserByEmail(session.user.email || "");
    }
    if (!user) {
      // Create user if they don't exist
      try {
        user = await dataService.createUser({
          email: session.user.email || "",
          name: session.user.name || "User",
          plan: "free",
        });
      } catch (createError) {
        console.error("Error creating user during update:", createError);
        user = await dataService.getUserByEmail(session.user.email || "");
        if (!user) {
          return NextResponse.json(
            { error: "User not found and could not be created" },
            { status: 500 }
          );
        }
      }
    }

    const updatedUser = await dataService.updateUser(user.id, validationResult.data);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      plan: updatedUser.plan,
      phone: updatedUser.phone || "",
      location: updatedUser.location || "",
      avatar: updatedUser.avatar || "",
      updatedAt: updatedUser.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}


