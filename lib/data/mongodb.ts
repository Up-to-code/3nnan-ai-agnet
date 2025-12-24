/**
 * MongoDB Data Service Implementation using Mongoose
 * Production-ready data layer using Mongoose ORM
 */

import { connectMongoose, isMongooseConnected } from "@/lib/db/mongoose";
import type { DataService } from "./types";
import type {
  User,
  CreateUserInput,
  Conversation,
  CreateConversationInput,
  Message,
  CreateMessageInput,
  Property,
  PropertyQuery,
  CreatePropertyInput,
  Appointment,
  CreateAppointmentInput,
  Service,
  PendingTask,
} from "@/types";
import {
  UserModel,
  ConversationModel,
  MessageModel,
  PropertyModel,
  AppointmentModel,
  ServiceModel,
  PendingTaskModel,
} from "@/lib/models";

// ============================================
// Rate Limiting Configuration
// ============================================

const RATE_LIMIT_CONFIG = {
  maxRequests: 20,
  windowMs: 1000, // 1 second window
};

// ============================================
// Helper: Transform Mongoose lean document
// ============================================

/**
 * Transforms a Mongoose lean document to replace _id with id
 * This is needed because .lean() bypasses toJSON transforms
 */
function transformDoc<T>(doc: Record<string, unknown> | null): T | null {
  if (!doc) return null;
  const transformed = { ...doc };
  if (transformed._id) {
    transformed.id = transformed._id.toString();
    delete transformed._id;
  }
  delete transformed.__v;
  return transformed as T;
}

/**
 * Transforms an array of Mongoose lean documents
 */
function transformDocs<T>(docs: Record<string, unknown>[]): T[] {
  return docs.map((doc) => transformDoc<T>(doc)!);
}

// ============================================
// MongoDB Data Service
// ============================================

class MongoDBDataService implements DataService {
  private rateLimits: Map<string, number[]> = new Map();

  // ============================================
  // User Operations
  // ============================================

  async getUser(id: string): Promise<User | null> {
    try {
      const doc = await UserModel.findById(id).lean();
      return transformDoc<User>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
      return transformDoc<User>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const user = await UserModel.create({
      email: data.email.toLowerCase(),
      name: data.name,
      plan: data.plan || "free",
    });
    return user.toJSON() as unknown as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      ).lean();
      return transformDoc<User>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  // ============================================
  // Conversation Operations
  // ============================================

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const doc = await ConversationModel.findById(id).lean();
      return transformDoc<Conversation>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const docs = await ConversationModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    return transformDocs<Conversation>(docs as Record<string, unknown>[]);
  }

  async createConversation(data: CreateConversationInput): Promise<Conversation> {
    const conversation = await ConversationModel.create({
      userId: data.userId,
      title: data.title,
    });
    const result = conversation.toJSON() as unknown as Conversation;
    // Safeguard: ensure id is set from _id if toJSON transform didn't run
    if (!result.id && conversation._id) {
      result.id = conversation._id.toString();
    }
    return result;
  }

  async updateConversation(
    id: string,
    data: Partial<Conversation>
  ): Promise<Conversation | null> {
    try {
      const doc = await ConversationModel.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      ).lean();
      return transformDoc<Conversation>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      // Delete conversation and its messages
      await MessageModel.deleteMany({ conversationId: id });
      const result = await ConversationModel.findByIdAndDelete(id);
      return !!result;
    } catch {
      return false;
    }
  }

  // ============================================
  // Message Operations
  // ============================================

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const docs = await MessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => {
      const message = transformDoc<Message>(doc as Record<string, unknown>)!;
      // Ensure timestamp is set from createdAt
      if (!message.timestamp && message.createdAt) {
        const dateVal = message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt as unknown as string);
        message.timestamp = dateVal.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return message;
    });
  }

  async addMessage(data: CreateMessageInput): Promise<Message> {
    const message = await MessageModel.create({
      conversationId: data.conversationId,
      content: data.content,
      isAi: data.isAi,
      type: data.type || "text",
      data: data.data,
    });

    // Update conversation's lastMessage and updatedAt
    await ConversationModel.findByIdAndUpdate(data.conversationId, {
      lastMessage: data.content.substring(0, 100),
    });

    const messageJson = message.toJSON() as unknown as Message;
    // Add timestamp from createdAt
    if (messageJson.createdAt) {
      messageJson.timestamp = new Date(messageJson.createdAt).toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageJson;
  }

  async getContextMessages(conversationId: string, limit = 10): Promise<Message[]> {
    const docs = await MessageModel.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs
      .reverse()
      .map((doc) => {
        const message = transformDoc<Message>(doc as Record<string, unknown>)!;
        // Ensure timestamp is set from createdAt
        if (!message.timestamp && message.createdAt) {
          const dateVal = message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt as unknown as string);
          message.timestamp = dateVal.toLocaleTimeString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        return message;
      });
  }

  // ============================================
  // Property Operations
  // ============================================

  async searchProperties(query: PropertyQuery): Promise<Property[]> {
    const filter: Record<string, unknown> = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.location) {
      filter.location = { $regex: query.location, $options: "i" };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.priceNumeric = {};
      if (query.minPrice !== undefined) {
        (filter.priceNumeric as Record<string, number>).$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (filter.priceNumeric as Record<string, number>).$lte = query.maxPrice;
      }
    }

    if (query.minBedrooms !== undefined) {
      filter.bedrooms = { $gte: query.minBedrooms };
    }

    if (query.maxBedrooms !== undefined) {
      filter.bedrooms = { ...((filter.bedrooms as object) || {}), $lte: query.maxBedrooms };
    }

    const docs = await PropertyModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(query.offset || 0)
      .limit(query.limit || 10)
      .lean();

    return transformDocs<Property>(docs as Record<string, unknown>[]);
  }

  async getProperty(id: string): Promise<Property | null> {
    try {
      const doc = await PropertyModel.findById(id).lean();
      return transformDoc<Property>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async createProperty(data: CreatePropertyInput): Promise<Property> {
    const property = await PropertyModel.create(data);
    return property.toJSON() as unknown as Property;
  }

  // ============================================
  // Appointment Operations
  // ============================================

  async getAppointments(userId: string): Promise<Appointment[]> {
    const docs = await AppointmentModel.find({ userId })
      .sort({ date: 1, time: 1 })
      .lean();
    return transformDocs<Appointment>(docs as Record<string, unknown>[]);
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    try {
      const doc = await AppointmentModel.findById(id).lean();
      return transformDoc<Appointment>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
    const appointment = await AppointmentModel.create({
      ...data,
      status: data.status || "pending",
    });
    return appointment.toJSON() as unknown as Appointment;
  }

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment | null> {
    try {
      const doc = await AppointmentModel.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      ).lean();
      return transformDoc<Appointment>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  // ============================================
  // Service Operations
  // ============================================

  async getServices(category?: string): Promise<Service[]> {
    const filter = category ? { category } : {};
    const docs = await ServiceModel.find(filter).lean();
    return transformDocs<Service>(docs as Record<string, unknown>[]);
  }

  async getService(id: string): Promise<Service | null> {
    try {
      const doc = await ServiceModel.findById(id).lean();
      return transformDoc<Service>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  // ============================================
  // Rate Limiting (In-memory for performance)
  // ============================================

  async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

    // Get existing timestamps
    let timestamps = this.rateLimits.get(userId) || [];

    // Filter to only timestamps within window
    timestamps = timestamps.filter((t) => t > windowStart);

    // Check if under limit
    return timestamps.length < RATE_LIMIT_CONFIG.maxRequests;
  }

  async recordRequest(userId: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

    let timestamps = this.rateLimits.get(userId) || [];
    timestamps = timestamps.filter((t) => t > windowStart);
    timestamps.push(now);

    this.rateLimits.set(userId, timestamps);
  }

  // ============================================
  // Pending Tasks
  // ============================================

  async getPendingTasks(userId: string): Promise<PendingTask[]> {
    const docs = await PendingTaskModel.find({
      userId,
      status: { $in: ["pending", "processing"] },
    }).lean();
    return transformDocs<PendingTask>(docs as Record<string, unknown>[]);
  }

  async createPendingTask(userId: string, conversationId: string): Promise<PendingTask> {
    const task = await PendingTaskModel.create({
      userId,
      conversationId,
      status: "pending",
    });
    return task.toJSON() as unknown as PendingTask;
  }

  async updatePendingTask(
    id: string,
    data: Partial<PendingTask>
  ): Promise<PendingTask | null> {
    try {
      const doc = await PendingTaskModel.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      ).lean();
      return transformDoc<PendingTask>(doc as Record<string, unknown> | null);
    } catch {
      return null;
    }
  }

  // ============================================
  // Health & Utility
  // ============================================

  async healthCheck(): Promise<boolean> {
    return isMongooseConnected();
  }

  async initialize(): Promise<void> {
    await connectMongoose();
    console.log("✅ MongoDB Data Service initialized with Mongoose");
  }

  async cleanup(): Promise<void> {
    this.rateLimits.clear();
    // Note: We don't disconnect Mongoose here as better-auth might still need it
    // Disconnection should be handled at application shutdown
  }
}

// Export singleton instance
export const mongoDBService = new MongoDBDataService();
export default mongoDBService;
