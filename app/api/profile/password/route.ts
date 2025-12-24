/**
 * Password Change API Endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

// ============================================
// Request Validation Schema
// ============================================

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "current password is required"),
  newPassword: z.string().min(8, "new password must be at least 8 characters"),
});

// ============================================
// POST Handler - Change Password
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Verify current password by attempting sign in
    const { auth } = await import("@/auth");
    try {
      const verifyResult = await auth.api.signInEmail({
        body: {
          email: session.user.email,
          password: currentPassword,
        },
        headers: request.headers,
      });

      if (!verifyResult || verifyResult.error) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update password - better-auth handles password hashing
    // We need to update the password in the database using better-auth's methods
    // For now, return success after verification
    // TODO: Implement proper password update using better-auth's password update endpoint
    
    return NextResponse.json({ 
      success: true,
      message: "Password verification successful. Password update feature coming soon."
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

