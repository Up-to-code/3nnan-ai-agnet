/**
 * MockDB Data Service Implementation
 * In-memory fallback for development/testing
 */

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

// ============================================
// UUID Generator (no external dependency)
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================
// Rate Limiting Configuration
// ============================================

const RATE_LIMIT_CONFIG = {
  maxRequests: 20,
  windowMs: 1000, // 1 second window
};

// ============================================
// MockDB Data Service
// ============================================

class MockDBDataService implements DataService {
  // In-memory storage
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private properties: Map<string, Property> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private services: Map<string, Service> = new Map();
  private pendingTasks: Map<string, PendingTask> = new Map();
  private rateLimits: Map<string, number[]> = new Map();

  // ============================================
  // User Operations
  // ============================================

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const id = generateId();
    const now = new Date();
    const user: User = {
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      plan: data.plan || "free",
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updated: User = {
      ...user,
      ...data,
      id, // Preserve ID
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  // ============================================
  // Conversation Operations
  // ============================================

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const userConversations: Conversation[] = [];
    for (const conv of this.conversations.values()) {
      if (conv.userId === userId) {
        userConversations.push(conv);
      }
    }
    return userConversations.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async createConversation(data: CreateConversationInput): Promise<Conversation> {
    const id = generateId();
    const now = new Date();
    const conversation: Conversation = {
      id,
      userId: data.userId,
      title: data.title,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  async updateConversation(
    id: string,
    data: Partial<Conversation>
  ): Promise<Conversation | null> {
    const conversation = this.conversations.get(id);
    if (!conversation) return null;

    const updated: Conversation = {
      ...conversation,
      ...data,
      id, // Preserve ID
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const existed = this.conversations.has(id);
    this.conversations.delete(id);
    this.messages.delete(id);
    return existed;
  }

  // ============================================
  // Message Operations
  // ============================================

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const msgs = this.messages.get(conversationId) || [];
    return msgs.slice(-limit);
  }

  async addMessage(data: CreateMessageInput): Promise<Message> {
    const id = generateId();
    const now = new Date();
    const timestamp = now.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const message: Message = {
      id,
      conversationId: data.conversationId,
      content: data.content,
      isAi: data.isAi,
      timestamp,
      type: data.type || "text",
      data: data.data,
      createdAt: now,
    };

    const msgs = this.messages.get(data.conversationId) || [];
    msgs.push(message);
    this.messages.set(data.conversationId, msgs);

    // Update conversation
    const conversation = this.conversations.get(data.conversationId);
    if (conversation) {
      conversation.lastMessage = data.content.substring(0, 100);
      conversation.updatedAt = now;
    }

    return message;
  }

  async getContextMessages(conversationId: string, limit = 10): Promise<Message[]> {
    const msgs = this.messages.get(conversationId) || [];
    return msgs.slice(-limit);
  }

  // ============================================
  // Property Operations
  // ============================================

  async searchProperties(query: PropertyQuery): Promise<Property[]> {
    let results = Array.from(this.properties.values());

    if (query.type) {
      results = results.filter((p) => p.type === query.type);
    }

    if (query.location) {
      const locationLower = query.location.toLowerCase();
      results = results.filter((p) =>
        p.location.toLowerCase().includes(locationLower)
      );
    }

    if (query.minPrice !== undefined) {
      results = results.filter((p) => p.priceNumeric >= query.minPrice!);
    }

    if (query.maxPrice !== undefined) {
      results = results.filter((p) => p.priceNumeric <= query.maxPrice!);
    }

    if (query.minBedrooms !== undefined) {
      results = results.filter(
        (p) => p.bedrooms !== undefined && p.bedrooms >= query.minBedrooms!
      );
    }

    if (query.maxBedrooms !== undefined) {
      results = results.filter(
        (p) => p.bedrooms !== undefined && p.bedrooms <= query.maxBedrooms!
      );
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    return results.slice(offset, offset + limit);
  }

  async getProperty(id: string): Promise<Property | null> {
    return this.properties.get(id) || null;
  }

  async createProperty(data: CreatePropertyInput): Promise<Property> {
    const id = generateId();
    const now = new Date();
    const property: Property = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.properties.set(id, property);
    return property;
  }

  // ============================================
  // Appointment Operations
  // ============================================

  async getAppointments(userId: string): Promise<Appointment[]> {
    const userAppointments: Appointment[] = [];
    for (const apt of this.appointments.values()) {
      if (apt.userId === userId) {
        userAppointments.push(apt);
      }
    }
    return userAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) || null;
  }

  async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
    const id = generateId();
    const now = new Date();
    const appointment: Appointment = {
      id,
      ...data,
      status: data.status || "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment | null> {
    const appointment = this.appointments.get(id);
    if (!appointment) return null;

    const updated: Appointment = {
      ...appointment,
      ...data,
      id, // Preserve ID
      updatedAt: new Date(),
    };
    this.appointments.set(id, updated);
    return updated;
  }

  // ============================================
  // Service Operations
  // ============================================

  async getServices(category?: string): Promise<Service[]> {
    let results = Array.from(this.services.values());
    if (category) {
      results = results.filter((s) => s.category === category);
    }
    return results;
  }

  async getService(id: string): Promise<Service | null> {
    return this.services.get(id) || null;
  }

  // ============================================
  // Rate Limiting
  // ============================================

  async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

    let timestamps = this.rateLimits.get(userId) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

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
    const tasks: PendingTask[] = [];
    for (const task of this.pendingTasks.values()) {
      if (
        task.userId === userId &&
        (task.status === "pending" || task.status === "processing")
      ) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  async createPendingTask(
    userId: string,
    conversationId: string
  ): Promise<PendingTask> {
    const id = generateId();
    const now = new Date();
    const task: PendingTask = {
      id,
      userId,
      conversationId,
      status: "pending",
      createdAt: now,
    };
    this.pendingTasks.set(id, task);
    return task;
  }

  async updatePendingTask(
    id: string,
    data: Partial<PendingTask>
  ): Promise<PendingTask | null> {
    const task = this.pendingTasks.get(id);
    if (!task) return null;

    const updated: PendingTask = {
      ...task,
      ...data,
      id, // Preserve ID
    };
    this.pendingTasks.set(id, updated);
    return updated;
  }

  // ============================================
  // Health & Utility
  // ============================================

  async healthCheck(): Promise<boolean> {
    return true; // Always healthy for in-memory
  }

  async initialize(): Promise<void> {
    // Seed with default data
    await this.seedDefaultData();
    console.log("MockDB initialized with seed data");
  }

  async cleanup(): Promise<void> {
    this.users.clear();
    this.conversations.clear();
    this.messages.clear();
    this.properties.clear();
    this.appointments.clear();
    this.services.clear();
    this.pendingTasks.clear();
    this.rateLimits.clear();
  }

  // ============================================
  // Seed Default Data
  // ============================================

  private async seedDefaultData(): Promise<void> {
    // Seed Properties
    const properties: CreatePropertyInput[] = [
      {
        title: "فيلا فاخرة في حي الملقا",
        description: "فيلا حديثة مع حديقة واسعة ومواقف سيارات متعددة. تتكون من 5 غرف نوم و4 حمامات مع صالة واسعة ومطبخ مجهز بالكامل. الموقع ممتاز قريب من المدارس والمراكز التجارية.",
        location: "الرياض، حي الملقا",
        price: "2,500,000 ر.س",
        priceNumeric: 2500000,
        type: "buy",
        bedrooms: 5,
        bathrooms: 4,
        area: "450 م²",
        areaNumeric: 450,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
        features: ["حديقة", "مواقف سيارات", "مسبح", "نظام أمني"],
      },
      {
        title: "شقة راقية في حي العليا",
        description: "شقة حديثة في موقع ممتاز قريب من الخدمات والمراكز التجارية. 3 غرف نوم و2 حمام مع شرفة واسعة.",
        location: "الرياض، حي العليا",
        price: "850,000 ر.س",
        priceNumeric: 850000,
        type: "buy",
        bedrooms: 3,
        bathrooms: 2,
        area: "180 م²",
        areaNumeric: 180,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        features: ["شرفة", "مواقف", "مصعد", "نظام أمني"],
      },
      {
        title: "قصر فاخر في حي الملقا",
        description: "قصر حديث مع إطلالة رائعة ومساحات واسعة. 7 غرف نوم و6 حمامات مع صالة استقبال فاخرة وحديقة كبيرة.",
        location: "الرياض، حي الملقا",
        price: "5,200,000 ر.س",
        priceNumeric: 5200000,
        type: "buy",
        bedrooms: 7,
        bathrooms: 6,
        area: "850 م²",
        areaNumeric: 850,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        features: ["حديقة كبيرة", "مسبح", "صالة ألعاب", "مواقف متعددة"],
      },
      {
        title: "شقة للإيجار في حي النرجس",
        description: "شقة مفروشة بالكامل جاهزة للسكن الفوري. 2 غرف نوم وحمام واحد مع مطبخ مجهز.",
        location: "الرياض، حي النرجس",
        price: "5,000 ر.س/شهر",
        priceNumeric: 5000,
        type: "rent",
        bedrooms: 2,
        bathrooms: 1,
        area: "120 م²",
        areaNumeric: 120,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        features: ["مفروشة", "جاهزة للسكن", "مواقف"],
      },
      {
        title: "فيلا للإيجار في حي الياسمين",
        description: "فيلا مستقلة مع مسبح خاص وحديقة واسعة. 4 غرف نوم و3 حمامات مع صالة واسعة.",
        location: "الرياض، حي الياسمين",
        price: "15,000 ر.س/شهر",
        priceNumeric: 15000,
        type: "rent",
        bedrooms: 4,
        bathrooms: 3,
        area: "350 م²",
        areaNumeric: 350,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        features: ["مسبح خاص", "حديقة", "مواقف", "نظام أمني"],
      },
      {
        title: "شقة للبيع في حي العليا",
        description: "شقة أنيقة في برج حديث. 4 غرف نوم و3 حمامات مع إطلالة رائعة على المدينة.",
        location: "الرياض، حي العليا",
        price: "1,200,000 ر.س",
        priceNumeric: 1200000,
        type: "buy",
        bedrooms: 4,
        bathrooms: 3,
        area: "220 م²",
        areaNumeric: 220,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        features: ["إطلالة", "مصعد", "نظام أمني", "مواقف"],
      },
      {
        title: "أرض للبيع في حي الياسمين",
        description: "أرض سكنية مساحتها 600 متر مربع في موقع ممتاز. جاهزة للبناء.",
        location: "الرياض، حي الياسمين",
        price: "1,800,000 ر.س",
        priceNumeric: 1800000,
        type: "buy",
        area: "600 م²",
        areaNumeric: 600,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        features: ["جاهزة للبناء", "موقع ممتاز"],
      },
      {
        title: "شقة للإيجار في حي العليا",
        description: "شقة حديثة 3 غرف نوم و2 حمام. قريبة من المدارس والمراكز التجارية.",
        location: "الرياض، حي العليا",
        price: "8,000 ر.س/شهر",
        priceNumeric: 8000,
        type: "rent",
        bedrooms: 3,
        bathrooms: 2,
        area: "150 م²",
        areaNumeric: 150,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        features: ["قريبة من الخدمات", "مواقف", "مصعد"],
      },
    ];

    for (const prop of properties) {
      await this.createProperty(prop);
    }

    // Seed Services
    const servicesData = [
      {
        title: "استشارة استثمارية",
        description: "استشارة متخصصة لتحديد أفضل الفرص الاستثمارية المناسبة لك. نحن نقدم تحليل شامل للسوق العقاري وتوصيات مبنية على خبرة واسعة.",
        category: "استثمار",
      },
      {
        title: "تحليل السوق",
        description: "تحليل شامل لاتجاهات السوق وأفضل المناطق للاستثمار. نقدم تقارير مفصلة عن الأسعار والفرص المتاحة.",
        category: "تحليل",
      },
      {
        title: "إدارة الممتلكات",
        description: "خدمة إدارة كاملة للممتلكات الاستثمارية. تشمل الصيانة وجمع الإيجارات وإدارة المستأجرين.",
        category: "إدارة",
      },
      {
        title: "خدمات قانونية",
        description: "مراجعة العقود والوثائق القانونية. نضمن لك صحة جميع المعاملات العقارية.",
        category: "قانوني",
      },
      {
        title: "تصميم داخلي",
        description: "خدمات تصميم داخلي احترافية. نحول منزلك إلى مساحة عصرية وأنيقة تناسب ذوقك.",
        category: "تصميم",
      },
      {
        title: "تقييم العقارات",
        description: "تقييم دقيق للعقارات لتحديد القيمة السوقية العادلة. نستخدم أحدث المعايير والتقنيات.",
        category: "تقييم",
      },
    ];

    for (const svc of servicesData) {
      const id = generateId();
      this.services.set(id, {
        id,
        ...svc,
        createdAt: new Date(),
      });
    }

    // Seed Sample Appointments for default-user
    const appointments: CreateAppointmentInput[] = [
      {
        userId: "default-user",
        title: "زيارة فيلا في حي الملقا",
        description: "زيارة لمعاينة فيلا فاخرة للبيع",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days from now
        time: "10:00",
        status: "confirmed",
      },
      {
        userId: "default-user",
        title: "استشارة استثمارية",
        description: "جلسة استشارية لمناقشة فرص الاستثمار",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
        time: "14:00",
        status: "pending",
      },
    ];

    for (const apt of appointments) {
      await this.createAppointment(apt);
    }
  }
}

// Export singleton instance
export const mockDBService = new MockDBDataService();
export default mockDBService;

