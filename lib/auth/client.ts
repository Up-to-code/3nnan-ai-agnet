/**
 * Better Auth Client
 * Client-side authentication utilities
 */

import { createAuthClient } from "better-auth/react";

// ============================================
// Auth Client Configuration
// ============================================

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

// ============================================
// Exported Auth Functions
// ============================================

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $fetch,
} = authClient;

// ============================================
// Helper Types
// ============================================

export type AuthError = {
  message: string;
  code?: string;
};

export type AuthResult<T = unknown> = {
  data?: T;
  error?: AuthError;
};
