/**
 * Centralized AI Model Configuration
 * 
 * This file manages all AI model settings for free and paid tiers.
 * Easy to update models without touching agent code.
 */

import type { UserPlan, ModelTier, ModelFeatures, ModelInfo } from "@/types";

// ============================================
// Model Configuration
// ============================================

export const MODEL_CONFIG = {
  // Free Tier Configuration
  FREE: {
    provider: "openrouter" as const,
    model: "openai/gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo",
    contextLimit: 4096,
    features: {
      streaming: true,
      toolCalling: true,
      vision: false,
    },
  },

  // Paid Tier Configuration
  PAID: {
    provider: "openrouter" as const,
    models: [
      {
        id: "anthropic/claude-3.5-sonnet",
        displayName: "Claude 3.5 Sonnet",
        contextLimit: 200000,
        features: { streaming: true, toolCalling: true, vision: true },
        tier: "premium" as ModelTier,
      },
      {
        id: "openai/gpt-4-turbo",
        displayName: "GPT-4 Turbo",
        contextLimit: 128000,
        features: { streaming: true, toolCalling: true, vision: true },
        tier: "premium" as ModelTier,
      },
      {
        id: "openai/gpt-4o",
        displayName: "GPT-4o",
        contextLimit: 128000,
        features: { streaming: true, toolCalling: true, vision: true },
        tier: "premium" as ModelTier,
      },
      {
        id: "meta-llama/llama-3.1-70b-instruct",
        displayName: "Llama 3.1 70B",
        contextLimit: 8192,
        features: { streaming: true, toolCalling: true, vision: false },
        tier: "standard" as ModelTier,
      },
    ],
    defaultModel: "openai/gpt-4o",
  },
} as const;

// ============================================
// Model Selection Helpers
// ============================================

/**
 * Get the appropriate model based on user plan
 */
export function getModelForPlan(
  userPlan: UserPlan,
  preferredModel?: string
): string {
  if (userPlan === "free") {
    return MODEL_CONFIG.FREE.model;
  }

  // For paid users, use preferred model if valid, otherwise default
  if (preferredModel && isValidPaidModel(preferredModel)) {
    return preferredModel;
  }

  return MODEL_CONFIG.PAID.defaultModel;
}

/**
 * Check if a model is valid for paid users
 */
export function isValidPaidModel(modelId: string): boolean {
  return MODEL_CONFIG.PAID.models.some((m) => m.id === modelId);
}

/**
 * Get model configuration details
 */
export function getModelConfig(modelId: string): ModelInfo | null {
  // Check if it's the free model
  if (modelId === MODEL_CONFIG.FREE.model) {
    return {
      id: MODEL_CONFIG.FREE.model,
      displayName: MODEL_CONFIG.FREE.displayName,
      contextLimit: MODEL_CONFIG.FREE.contextLimit,
      features: MODEL_CONFIG.FREE.features,
      tier: "free",
    };
  }

  // Check paid models
  const paidModel = MODEL_CONFIG.PAID.models.find((m) => m.id === modelId);
  if (paidModel) {
    return {
      id: paidModel.id,
      displayName: paidModel.displayName,
      contextLimit: paidModel.contextLimit,
      features: paidModel.features,
      tier: paidModel.tier,
    };
  }

  return null;
}

/**
 * Get all available models for a user plan
 */
export function getAvailableModels(userPlan: UserPlan): ModelInfo[] {
  if (userPlan === "free") {
    return [
      {
        id: MODEL_CONFIG.FREE.model,
        displayName: MODEL_CONFIG.FREE.displayName,
        contextLimit: MODEL_CONFIG.FREE.contextLimit,
        features: MODEL_CONFIG.FREE.features,
        tier: "free",
      },
    ];
  }

  return MODEL_CONFIG.PAID.models.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    contextLimit: m.contextLimit,
    features: m.features,
    tier: m.tier,
  }));
}

// ============================================
// API Key Validation
// ============================================

/**
 * Validate OpenRouter API key
 */
export function validateApiKey(): boolean {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not found in environment variables");
    return false;
  }

  if (apiKey.length < 20) {
    console.error("OPENROUTER_API_KEY appears to be invalid (too short)");
    return false;
  }

  return true;
}

/**
 * Get OpenRouter configuration for Vercel AI SDK
 */
export function getOpenRouterConfig(modelId: string) {
  return {
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1",
    model: modelId,
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Anan AI - Real Estate Assistant",
    },
  };
}

// ============================================
// Context Limits
// ============================================

/**
 * Get the maximum context messages based on model
 */
export function getMaxContextMessages(modelId: string): number {
  const config = getModelConfig(modelId);
  if (!config) return 10;

  // Use roughly 1/4 of context for history
  // Assuming ~500 tokens per message average
  const messagesInContext = Math.floor(config.contextLimit / 2000);
  return Math.min(messagesInContext, 20); // Cap at 20 messages
}

/**
 * Get timeout for model (ms)
 */
export function getModelTimeout(modelId: string): number {
  const config = getModelConfig(modelId);
  if (!config) return 30000;

  // Premium models get more time
  if (config.tier === "premium") {
    return 60000; // 60 seconds
  }

  return 30000; // 30 seconds
}

// ============================================
// Export Types
// ============================================

export type { UserPlan, ModelTier, ModelFeatures, ModelInfo };

