/**
 * Data Service Factory
 * Selects the appropriate data service based on environment
 */

import type { DataService } from "./types";
import { mockDBService } from "./mockdb";

// ============================================
// Environment Detection
// ============================================

// Only use MongoDB if explicitly enabled AND URI is provided
const USE_MONGODB = process.env.USE_MONGODB === "true" && 
                    process.env.MONGODB_URI !== undefined &&
                    process.env.MONGODB_URI.length > 0;

// ============================================
// Data Service Singleton
// ============================================

let dataService: DataService | null = null;
let isInitialized = false;
let useFallback = false;

/**
 * Get the data service instance
 * Automatically selects MongoDB or MockDB based on environment
 */
export function getDataService(): DataService {
  if (!dataService) {
    if (USE_MONGODB && !useFallback) {
      // Dynamically import MongoDB service only when needed
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { mongoDBService } = require("./mongodb");
        console.log("📦 Using MongoDB data service");
        dataService = mongoDBService;
      } catch (error) {
        console.warn("⚠️ MongoDB service failed to load, using MockDB:", error);
        useFallback = true;
        dataService = mockDBService;
      }
    } else {
      console.log("📦 Using MockDB data service (in-memory)");
      dataService = mockDBService;
    }
  }
  return dataService;
}

/**
 * Initialize the data service
 * Should be called once at app startup
 */
export async function initializeDataService(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const service = getDataService();
  
  try {
    await service.initialize();
    isInitialized = true;
    console.log("✅ Data service initialized");
  } catch (error) {
    // If MongoDB fails, fall back to MockDB
    if (USE_MONGODB && !useFallback) {
      console.warn("⚠️ MongoDB initialization failed, falling back to MockDB:", error);
      useFallback = true;
      dataService = mockDBService;
      await mockDBService.initialize();
      isInitialized = true;
      console.log("✅ MockDB fallback initialized");
    } else {
      throw error;
    }
  }
}

/**
 * Cleanup the data service
 * Should be called on app shutdown
 */
export async function cleanupDataService(): Promise<void> {
  if (dataService) {
    await dataService.cleanup();
    dataService = null;
    isInitialized = false;
    console.log("🧹 Data service cleaned up");
  }
}

/**
 * Check if data service is healthy
 */
export async function checkDataServiceHealth(): Promise<boolean> {
  const service = getDataService();
  return service.healthCheck();
}

// ============================================
// Re-exports
// ============================================

export type { DataService } from "./types";
export { mongoDBService } from "./mongodb";
export { mockDBService } from "./mockdb";

// Default export
export default getDataService;

