// Simple MongoDB client for usage with better-auth or custom code.
// Fork-friendly: can be swapped for a production-ready DB client or mocked for testing.

import { MongoClient, ServerApiVersion, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myDatabase";

// Recommended pool, no strict retry logic (let app crash in dev)
const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 8,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

// Connects and caches DB instance. No reconnection logic, just let the server restart on disconnect in dev mode.
// (Wrap in higher error handling for production!)
// Used by e.g. better-auth adapter: see auth.ts
export async function connectDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  
  // If already connecting, wait for that connection
  if (connectionPromise) {
    return connectionPromise;
  }
  
  // Start new connection
  connectionPromise = (async () => {
    if (dbInstance) return dbInstance;
    
    if (!client) {
      try {
        client = new MongoClient(MONGODB_URI, clientOptions);
        await client.connect();
        dbInstance = client.db(DB_NAME);
      } catch (error) {
        client = null;
        connectionPromise = null;
        throw error;
      }
    } else {
      dbInstance = client.db(DB_NAME);
    }
    
    connectionPromise = null;
    return dbInstance;
  })();
  
  return connectionPromise;
}

// Return DB instance. If not connected, initializes the client immediately.
// This allows top-level imports for the CLI without explicit await calls.
export function getDb(): Db {
  if (!dbInstance) {
    // Initialize client if it doesn't exist
    if (!client) {
      client = new MongoClient(MONGODB_URI, clientOptions);
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