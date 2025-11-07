import { getDb } from './index';
import * as schema from './schema';

const db = getDb();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create demo users
    const users = await db
      .insert(schema.users)
      .values([
        {
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          emailVerified: true,
        },
        {
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user',
          emailVerified: true,
        },
        {
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          emailVerified: false,
        },
      ])
      .returning();

    console.log(`✅ Created ${users.length} users:`);
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seed();
}

export { seed };