/**
 * Data Service Interface
 * Allows swapping between MongoDB, MockDB, Redis, etc.
 */

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

/**
 * Main Data Service Interface
 * All data layer implementations must follow this interface
 */
export interface DataService {
  // ============================================
  // User Operations
  // ============================================
  
  /** Get user by ID */
  getUser(id: string): Promise<User | null>;
  
  /** Get user by email */
  getUserByEmail(email: string): Promise<User | null>;
  
  /** Create a new user */
  createUser(data: CreateUserInput): Promise<User>;
  
  /** Update user */
  updateUser(id: string, data: Partial<User>): Promise<User | null>;

  // ============================================
  // Conversation Operations
  // ============================================
  
  /** Get conversation by ID */
  getConversation(id: string): Promise<Conversation | null>;
  
  /** Get all conversations for a user */
  getConversations(userId: string): Promise<Conversation[]>;
  
  /** Create a new conversation */
  createConversation(data: CreateConversationInput): Promise<Conversation>;
  
  /** Update conversation (title, lastMessage) */
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null>;
  
  /** Delete conversation */
  deleteConversation(id: string): Promise<boolean>;

  // ============================================
  // Message Operations
  // ============================================
  
  /** Get messages for a conversation */
  getMessages(conversationId: string, limit?: number): Promise<Message[]>;
  
  /** Add a message to a conversation */
  addMessage(data: CreateMessageInput): Promise<Message>;
  
  /** Get last N messages for context */
  getContextMessages(conversationId: string, limit?: number): Promise<Message[]>;

  // ============================================
  // Property Operations (for search tool)
  // ============================================
  
  /** Search properties with filters */
  searchProperties(query: PropertyQuery): Promise<Property[]>;
  
  /** Get property by ID */
  getProperty(id: string): Promise<Property | null>;
  
  /** Create property (for seeding) */
  createProperty(data: CreatePropertyInput): Promise<Property>;

  // ============================================
  // Appointment Operations
  // ============================================
  
  /** Get appointments for a user */
  getAppointments(userId: string): Promise<Appointment[]>;
  
  /** Get appointment by ID */
  getAppointment(id: string): Promise<Appointment | null>;
  
  /** Create appointment */
  createAppointment(data: CreateAppointmentInput): Promise<Appointment>;
  
  /** Update appointment status */
  updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | null>;

  // ============================================
  // Service Operations
  // ============================================
  
  /** Get all services */
  getServices(category?: string): Promise<Service[]>;
  
  /** Get service by ID */
  getService(id: string): Promise<Service | null>;

  // ============================================
  // Rate Limiting
  // ============================================
  
  /** Check if user is rate limited (returns true if allowed) */
  checkRateLimit(userId: string): Promise<boolean>;
  
  /** Record a request for rate limiting */
  recordRequest(userId: string): Promise<void>;

  // ============================================
  // Pending Tasks (for SSE)
  // ============================================
  
  /** Get pending tasks for a user */
  getPendingTasks(userId: string): Promise<PendingTask[]>;
  
  /** Create a pending task */
  createPendingTask(userId: string, conversationId: string): Promise<PendingTask>;
  
  /** Update task status */
  updatePendingTask(id: string, data: Partial<PendingTask>): Promise<PendingTask | null>;

  // ============================================
  // Health & Utility
  // ============================================
  
  /** Check if the data service is healthy */
  healthCheck(): Promise<boolean>;
  
  /** Initialize the data service (create indexes, etc.) */
  initialize(): Promise<void>;
  
  /** Clean up resources */
  cleanup(): Promise<void>;
}

/**
 * Data Service Factory Type
 */
export type DataServiceFactory = () => DataService;

/**
 * Pagination Options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Query Result with Pagination
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

