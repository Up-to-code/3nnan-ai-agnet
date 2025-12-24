/**
 * MongoDB Seed Script
 * Populates the database with mock data for testing
 * 
 * Run with: npm run seed
 */

import { MongoClient, Db } from "mongodb";

// ============================================
// Configuration
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myDatabase";

// ============================================
// Mock Data
// ============================================

const mockUsers = [
  {
    email: "free@test.com",
    name: "مستخدم مجاني",
    plan: "free",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: "paid@test.com",
    name: "مستخدم مدفوع",
    plan: "paid",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: "admin@test.com",
    name: "المدير",
    plan: "paid",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockProperties = [
  {
    title: "فيلا فاخرة في حي الملقا",
    description: "فيلا حديثة مع حديقة واسعة ومواقف سيارات، تصميم عصري وتشطيبات فاخرة",
    location: "الرياض، حي الملقا",
    price: "2,500,000 ر.س",
    priceNumeric: 2500000,
    type: "buy",
    bedrooms: 5,
    bathrooms: 4,
    area: "450 م²",
    areaNumeric: 450,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    features: ["حديقة", "مسبح", "مواقف سيارات", "غرفة خادمة"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "شقة راقية في حي العليا",
    description: "شقة حديثة في موقع ممتاز قريب من الخدمات والمراكز التجارية",
    location: "الرياض، حي العليا",
    price: "850,000 ر.س",
    priceNumeric: 850000,
    type: "buy",
    bedrooms: 3,
    bathrooms: 2,
    area: "180 م²",
    areaNumeric: 180,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    features: ["مصعد", "حارس أمن", "موقف سيارة"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "قصر فاخر في حي الملقا",
    description: "قصر حديث مع إطلالة رائعة ومساحات واسعة وتشطيبات ملكية",
    location: "الرياض، حي الملقا",
    price: "5,200,000 ر.س",
    priceNumeric: 5200000,
    type: "buy",
    bedrooms: 7,
    bathrooms: 6,
    area: "850 م²",
    areaNumeric: 850,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    features: ["مسبح داخلي", "حديقة كبيرة", "غرفة سينما", "جيم"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "شقة للإيجار في حي النرجس",
    description: "شقة مفروشة بالكامل جاهزة للسكن مع إطلالة جميلة",
    location: "الرياض، حي النرجس",
    price: "5,000 ر.س/شهر",
    priceNumeric: 5000,
    type: "rent",
    bedrooms: 2,
    bathrooms: 1,
    area: "120 م²",
    areaNumeric: 120,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    features: ["مفروشة", "تكييف مركزي", "موقف سيارة"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "فيلا للإيجار في حي الياسمين",
    description: "فيلا مستقلة مع مسبح خاص ومساحات خضراء",
    location: "الرياض، حي الياسمين",
    price: "15,000 ر.س/شهر",
    priceNumeric: 15000,
    type: "rent",
    bedrooms: 4,
    bathrooms: 3,
    area: "350 م²",
    areaNumeric: 350,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    features: ["مسبح خاص", "حديقة", "مجلس خارجي"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "دوبلكس عصري في حي الورود",
    description: "دوبلكس حديث بتصميم مميز وتشطيبات عالية الجودة",
    location: "الرياض، حي الورود",
    price: "1,200,000 ر.س",
    priceNumeric: 1200000,
    type: "buy",
    bedrooms: 4,
    bathrooms: 3,
    area: "280 م²",
    areaNumeric: 280,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    features: ["روف خاص", "مطبخ أمريكي", "غرفة غسيل"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "شقة استوديو في حي العليا",
    description: "استوديو مثالي للعزاب أو الطلاب قريب من الجامعات",
    location: "الرياض، حي العليا",
    price: "2,500 ر.س/شهر",
    priceNumeric: 2500,
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: "45 م²",
    areaNumeric: 45,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    features: ["مفروش", "إنترنت مجاني", "قريب من المواصلات"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "أرض سكنية في حي القيروان",
    description: "أرض سكنية بموقع استراتيجي مناسبة للبناء",
    location: "الرياض، حي القيروان",
    price: "800,000 ر.س",
    priceNumeric: 800000,
    type: "buy",
    area: "600 م²",
    areaNumeric: 600,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    features: ["شارعين", "قريب من المسجد", "جميع الخدمات متوفرة"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "مكتب تجاري في حي الصحافة",
    description: "مكتب جاهز للاستخدام في برج تجاري راقي",
    location: "الرياض، حي الصحافة",
    price: "8,000 ر.س/شهر",
    priceNumeric: 8000,
    type: "rent",
    area: "100 م²",
    areaNumeric: 100,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    features: ["تكييف مركزي", "استقبال", "قاعة اجتماعات"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "فيلا سمارت في حي الرمال",
    description: "فيلا ذكية مع نظام أتمتة منزلي متكامل",
    location: "الرياض، حي الرمال",
    price: "3,800,000 ر.س",
    priceNumeric: 3800000,
    type: "buy",
    bedrooms: 6,
    bathrooms: 5,
    area: "550 م²",
    areaNumeric: 550,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    features: ["نظام ذكي", "طاقة شمسية", "كاميرات مراقبة", "مصعد"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockServices = [
  {
    title: "استشارة استثمارية",
    description: "استشارة متخصصة لتحديد أفضل الفرص الاستثمارية المناسبة لميزانيتك وأهدافك",
    category: "استثمار",
    price: "500 ر.س",
    createdAt: new Date(),
  },
  {
    title: "تحليل السوق",
    description: "تحليل شامل لاتجاهات السوق العقاري وأفضل المناطق للاستثمار مع تقرير مفصل",
    category: "تحليل",
    price: "1,000 ر.س",
    createdAt: new Date(),
  },
  {
    title: "إدارة الممتلكات",
    description: "خدمة إدارة كاملة للممتلكات الاستثمارية تشمل التأجير والصيانة والتحصيل",
    category: "إدارة",
    price: "5% من الإيجار",
    createdAt: new Date(),
  },
  {
    title: "خدمات قانونية",
    description: "مراجعة العقود والوثائق القانونية والتأكد من سلامة الإجراءات",
    category: "قانوني",
    price: "1,500 ر.س",
    createdAt: new Date(),
  },
  {
    title: "تصميم داخلي",
    description: "خدمات تصميم داخلي احترافية لتحويل منزلك إلى تحفة فنية",
    category: "تصميم",
    price: "يبدأ من 5,000 ر.س",
    createdAt: new Date(),
  },
  {
    title: "تقييم عقاري",
    description: "تقييم احترافي معتمد لقيمة العقار السوقية",
    category: "تقييم",
    price: "2,000 ر.س",
    createdAt: new Date(),
  },
  {
    title: "جولات افتراضية",
    description: "تصوير 360 درجة وجولات افتراضية للعقارات",
    category: "تسويق",
    price: "1,500 ر.س",
    createdAt: new Date(),
  },
];

const mockAppointments = [
  {
    userId: "", // Will be filled with actual user ID
    title: "زيارة عقار - حي الملقا",
    description: "زيارة فيلا فاخرة للمعاينة",
    date: "2025-01-15",
    time: "04:00 م",
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "",
    title: "توقيع عقد البيع",
    description: "توقيع عقد بيع الشقة في حي العليا",
    date: "2025-01-18",
    time: "10:00 ص",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "",
    title: "استشارة استثمارية",
    description: "جلسة استشارية لتحديد الفرص الاستثمارية",
    date: "2025-01-20",
    time: "03:00 م",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "",
    title: "معاينة شقة للإيجار",
    description: "معاينة شقة في حي النرجس",
    date: "2025-01-12",
    time: "11:00 ص",
    status: "cancelled",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "",
    title: "اجتماع مع المصمم",
    description: "مناقشة التصميم الداخلي للفيلا",
    date: "2025-01-25",
    time: "02:00 م",
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockConversations = [
  {
    userId: "",
    title: "البحث عن فيلا في الملقا",
    lastMessage: "إليك أفضل الخيارات المتاحة",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    userId: "",
    title: "استفسار عن الأسعار",
    lastMessage: "متوسط أسعار المنطقة...",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    userId: "",
    title: "حجز موعد معاينة",
    lastMessage: "تم حجز الموعد بنجاح",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// ============================================
// Seed Functions
// ============================================

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  let client: MongoClient | null = null;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db: Db = client.db(DB_NAME);

    // Clear existing data
    console.log("\n🧹 Clearing existing data...");
    await db.collection("users").deleteMany({});
    await db.collection("properties").deleteMany({});
    await db.collection("services").deleteMany({});
    await db.collection("appointments").deleteMany({});
    await db.collection("conversations").deleteMany({});
    await db.collection("messages").deleteMany({});
    console.log("✅ Existing data cleared");

    // Seed Users
    console.log("\n👥 Seeding users...");
    const usersResult = await db.collection("users").insertMany(mockUsers);
    const userIds = Object.values(usersResult.insertedIds);
    console.log(`✅ ${userIds.length} users created`);

    // Seed Properties
    console.log("\n🏠 Seeding properties...");
    const propertiesResult = await db.collection("properties").insertMany(mockProperties);
    console.log(`✅ ${propertiesResult.insertedCount} properties created`);

    // Seed Services
    console.log("\n🛠️ Seeding services...");
    const servicesResult = await db.collection("services").insertMany(mockServices);
    console.log(`✅ ${servicesResult.insertedCount} services created`);

    // Seed Appointments (assign to first user)
    console.log("\n📅 Seeding appointments...");
    const appointmentsWithUser = mockAppointments.map((apt) => ({
      ...apt,
      userId: userIds[0].toString(),
    }));
    const appointmentsResult = await db.collection("appointments").insertMany(appointmentsWithUser);
    console.log(`✅ ${appointmentsResult.insertedCount} appointments created`);

    // Seed Conversations (assign to first user)
    console.log("\n💬 Seeding conversations...");
    const conversationsWithUser = mockConversations.map((conv) => ({
      ...conv,
      userId: userIds[0].toString(),
    }));
    const conversationsResult = await db.collection("conversations").insertMany(conversationsWithUser);
    const convIds = Object.values(conversationsResult.insertedIds);
    console.log(`✅ ${convIds.length} conversations created`);

    // Seed Messages for first conversation
    console.log("\n📝 Seeding messages...");
    const mockMessages = [
      {
        conversationId: convIds[0].toString(),
        content: "أبحث عن فيلا في حي الملقا",
        isAi: false,
        timestamp: "10:30 ص",
        type: "text",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        conversationId: convIds[0].toString(),
        content: "سأبحث لك عن أفضل الخيارات المتاحة في حي الملقا...",
        isAi: true,
        timestamp: "10:31 ص",
        type: "text",
        createdAt: new Date(Date.now() - 29 * 60 * 1000),
      },
      {
        conversationId: convIds[0].toString(),
        content: "إليك أفضل الخيارات المتاحة:",
        isAi: true,
        timestamp: "10:31 ص",
        type: "property-list",
        data: mockProperties.slice(0, 3).map((p, i) => ({ ...p, id: `prop-${i}` })),
        createdAt: new Date(Date.now() - 28 * 60 * 1000),
      },
    ];
    const messagesResult = await db.collection("messages").insertMany(mockMessages);
    console.log(`✅ ${messagesResult.insertedCount} messages created`);

    // Create indexes
    console.log("\n📇 Creating indexes...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("conversations").createIndex({ userId: 1 });
    await db.collection("conversations").createIndex({ updatedAt: -1 });
    await db.collection("messages").createIndex({ conversationId: 1 });
    await db.collection("messages").createIndex({ createdAt: 1 });
    await db.collection("properties").createIndex({ type: 1 });
    await db.collection("properties").createIndex({ location: "text" });
    await db.collection("properties").createIndex({ priceNumeric: 1 });
    await db.collection("appointments").createIndex({ userId: 1 });
    await db.collection("appointments").createIndex({ date: 1 });
    console.log("✅ Indexes created");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log(`
📊 Summary:
   - Users: ${userIds.length}
   - Properties: ${propertiesResult.insertedCount}
   - Services: ${servicesResult.insertedCount}
   - Appointments: ${appointmentsResult.insertedCount}
   - Conversations: ${convIds.length}
   - Messages: ${messagesResult.insertedCount}

🔑 Test Accounts:
   - free@test.com (Free tier)
   - paid@test.com (Paid tier)
   - admin@test.com (Admin)
`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 Database connection closed");
    }
  }
}

// Run seeding
seedDatabase();

