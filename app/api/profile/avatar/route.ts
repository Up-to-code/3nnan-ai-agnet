/**
 * Avatar Upload API Endpoint
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
// POST Handler - Upload Avatar
// ============================================

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage
    // In production, you'd upload to S3/Cloudinary/etc.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user avatar
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
        console.error("Error creating user during avatar upload:", createError);
        user = await dataService.getUserByEmail(session.user.email || "");
        if (!user) {
          return NextResponse.json(
            { error: "User not found and could not be created" },
            { status: 500 }
          );
        }
      }
    }

    const updatedUser = await dataService.updateUser(user.id, {
      avatar: dataUrl,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avatar: updatedUser.avatar || "",
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE Handler - Remove Avatar
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    await ensureInitialized();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataService = getDataService();
    
    // Ensure user exists before updating
    let user = await dataService.getUser(session.user.id);
    if (!user) {
      user = await dataService.getUserByEmail(session.user.email || "");
    }
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove avatar by setting it to empty string
    const updatedUser = await dataService.updateUser(user.id, {
      avatar: "",
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to remove avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avatar: "",
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}


