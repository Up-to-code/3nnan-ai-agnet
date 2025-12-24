/**
 * Better Auth Configuration
 * Centralized authentication setup with MongoDB adapter
 */

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "./lib/db";

// ============================================
// Database Adapter
// ============================================

const databaseAdapter = mongodbAdapter(getDb());

// ============================================
// Auth Configuration
// ============================================

export const auth = betterAuth({
  database: databaseAdapter,
  
  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  
  // Social Providers
  socialProviders: {
    google: {
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  
  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  // Advanced Options
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
});

export type Auth = typeof auth;
