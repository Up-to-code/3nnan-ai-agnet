// Simple MongoDB client for usage with better-auth or custom code.
// Fork-friendly: can be swapped for a production-ready DB client or mocked for testing.

import { MongoClient, ServerApiVersion, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myDatabase";

// Recommended pool with reconnection support
const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  // Enable automatic reconnection
  heartbeatFrequencyMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

// Connects and caches DB instance with reconnection logic
// Used by e.g. better-auth adapter: see auth.ts
export async function connectDB(): Promise<Db> {
  // Check if we have a valid connection
  if (dbInstance && client) {
    try {
      // Verify connection is still alive
      await client.db("admin").command({ ping: 1 });
      return dbInstance;
    } catch (error) {
      // Connection is dead, reset and reconnect
      console.warn("[DB] Connection lost, reconnecting...", error);
      try {
        await client.close();
      } catch {
        // Ignore close errors
      }
      client = null;
      dbInstance = null;
    }
  }
  
  // If already connecting, wait for that connection
  if (connectionPromise) {
    return connectionPromise;
  }
  
  // Start new connection
  connectionPromise = (async () => {
    // Double-check after waiting
    if (dbInstance && client) {
      try {
        await client.db("admin").command({ ping: 1 });
        connectionPromise = null;
        return dbInstance;
      } catch {
        // Connection failed, reset
        client = null;
        dbInstance = null;
      }
    }
    
    try {
      // Close old client if it exists
      if (client) {
        try {
          await client.close();
        } catch {
          // Ignore close errors
        }
      }
      
      // Create new client and connect
      client = new MongoClient(MONGODB_URI, clientOptions);
      
      // Set up connection event listeners for automatic reconnection
      client.on('error', (error) => {
        console.error("[DB] MongoDB client error:", error.message);
        // Reset connection state on topology closed errors
        if (error.message?.toLowerCase().includes('topology is closed')) {
          console.warn("[DB] Topology closed, will reconnect on next request");
          dbInstance = null;
        }
      });
      
      client.on('close', () => {
        console.warn("[DB] MongoDB connection closed");
        dbInstance = null;
      });
      
      await client.connect();
      dbInstance = client.db(DB_NAME);
      
      // Verify connection
      await client.db("admin").command({ ping: 1 });
      
      console.log("[DB] Successfully connected to MongoDB");
      
      connectionPromise = null;
      return dbInstance;
    } catch (error) {
      // Reset on error
      client = null;
      dbInstance = null;
      connectionPromise = null;
      console.error("[DB] Connection failed:", error);
      throw error;
    }
  })();
  
  return connectionPromise;
}

// Return DB instance. If not connected, initializes the client immediately.
// This allows top-level imports for the CLI without explicit await calls.
// Note: This doesn't ensure connection is active - use connectDB() for that.
// For better-auth adapter, we'll ensure connection in auth.ts
export function getDb(): Db {
  if (!dbInstance) {
    // Initialize client if it doesn't exist
    if (!client) {
      client = new MongoClient(MONGODB_URI, clientOptions);
      
      // Set up connection event listeners
      client.on('error', (error) => {
        console.error("[DB] MongoDB client error:", error.message);
        if (error.message?.toLowerCase().includes('topology is closed')) {
          dbInstance = null;
        }
      });
      
      client.on('close', () => {
        dbInstance = null;
      });
    }
    // We do NOT await client.connect() here to avoid blocking synchronous imports.
    // However, creating the client instance allows getDb() to return a valid Db object
    // which the adapter/CLI can use for schema inspection.
    dbInstance = client.db(DB_NAME);
  }
  return dbInstance;
}

// Check if MongoDB should be used (only if explicitly enabled and URI is provided)
export function shouldUseMongoDB(): boolean {
  return process.env.USE_MONGODB === "true" && 
         process.env.MONGODB_URI !== undefined &&
         process.env.MONGODB_URI.length > 0;
}

// Returns the underlying client if needed
export function getClient(): MongoClient {
  if (!client) {
    // Ensure client exists if requested, matching getDb behavior
    client = new MongoClient(MONGODB_URI, clientOptions);
  }
  return client;
}

// Close connection (for test/teardown or graceful shutdown)
export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
  }
}

// Quick health check: returns true if connected & ping succeeds, else false
export async function healthCheck(): Promise<boolean> {
  if (!client || !dbInstance) return false;
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

// Export for legacy default import
const dbModule = {
  connectDB,
  getDb,
  getClient,
  disconnectDB,
  healthCheck,
};

export default dbModule;