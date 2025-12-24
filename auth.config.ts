// auth.config.ts
// Configuration file for better-auth CLI (schema generation, etc.)
// The CLI does not need a real DB connection to generate the schema.
import { betterAuth } from "better-auth";

export default betterAuth({
  // Database adapter omitted for CLI - schema generation doesn't need real connection
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      enabled: false,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});