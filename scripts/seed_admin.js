/**
 * Seed Admin User
 * Tạo user ADMIN mặc định để test
 */

require('dotenv').config();
const { connectMongo, getDb } = require('../server/src/infra/db/mongoClient');
const { hashPassword } = require('../server/src/utils/password');
const { UserRoles, UserStatus } = require('../server/src/domain/entities/userEntity');

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongo();
    const db = getDb();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const fullName = process.env.ADMIN_FULL_NAME || 'Admin User';

    // Check if admin already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log(`Admin user already exists: ${email}`);
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const result = await db.collection('users').insertOne({
      email,
      passwordHash,
      role: UserRoles.ADMIN,
      fullName,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${UserRoles.ADMIN}`);
    console.log(`   ID: ${result.insertedId}`);

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('refresh_tokens').createIndex({ userId: 1 });
    await db.collection('refresh_tokens').createIndex({ tokenHash: 1 });

    console.log('\n✅ Indexes created for users and refresh_tokens');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdmin();

