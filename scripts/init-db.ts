// scripts/init-db.ts
// Manual MongoDB collection initialization for better-auth
// Run with: npx tsx scripts/init-db.ts
// or: ts-node scripts/init-db.ts

import { connectDB } from '../lib/db';

/**
 * Initialize MongoDB collections and indexes for better-auth
 * MongoDB doesn't support schema generation via CLI, so we do it manually
 */
async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    
    // Better-auth required collections
    const collections = [
      'user',
      'session',
      'account',
      'verification',
    ];

    console.log('Creating collections and indexes...');

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Check if collection exists
      const collections = await db.listCollections({ name: collectionName }).toArray();
      
      if (collections.length === 0) {
        // Create collection by inserting and deleting a dummy document
        await collection.insertOne({ _temp: true });
        await collection.deleteOne({ _temp: true });
        console.log(`✓ Created collection: ${collectionName}`);
      } else {
        console.log(`✓ Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes for better performance
    const userCollection = db.collection('user');
    await userCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await userCollection.createIndex({ id: 1 }, { unique: true });
    console.log('✓ Created indexes on user collection');

    const sessionCollection = db.collection('session');
    await sessionCollection.createIndex({ userId: 1 });
    await sessionCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await sessionCollection.createIndex({ id: 1 }, { unique: true });
    console.log('✓ Created indexes on session collection');

    const accountCollection = db.collection('account');
    await accountCollection.createIndex({ userId: 1 });
    await accountCollection.createIndex({ providerId: 1, providerAccountId: 1 }, { unique: true });
    console.log('✓ Created indexes on account collection');

    const verificationCollection = db.collection('verification');
    await verificationCollection.createIndex({ identifier: 1 });
    await verificationCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✓ Created indexes on verification collection');

    console.log('\n✅ Database initialization complete!');
    console.log('Better-auth collections are ready to use.');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initDatabase();

