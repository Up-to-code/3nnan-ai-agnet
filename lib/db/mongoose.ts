/**
 * Mongoose Connection
 * Separate connection for Mongoose ORM
 * Note: better-auth uses native MongoDB driver, so we maintain both connections
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myDatabase";

let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectMongoose(): Promise<void> {
  if (isConnected) {
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    // Extract database name from URI or use DB_NAME
    const uri = MONGODB_URI.includes("/") && MONGODB_URI.split("/").pop()?.includes("?")
      ? MONGODB_URI
      : `${MONGODB_URI}/${DB_NAME}`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("✅ Mongoose connected to MongoDB");
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error);
    isConnected = false;
    throw error;
  }
}

/**
 * Disconnect Mongoose
 */
export async function disconnectMongoose(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 Mongoose disconnected");
  }
}

/**
 * Check if Mongoose is connected
 */
export function isMongooseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get Mongoose connection
 */
export function getMongooseConnection(): typeof mongoose.connection {
  return mongoose.connection;
}

