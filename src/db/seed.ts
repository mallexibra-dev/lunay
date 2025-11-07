import { getDb } from './index';

const db = getDb();

async function seed() {
  console.log('🌱 Seeding database...');
  console.log('📝 Add your seed data here...');

  try {
    // Example: Add your seed data here
    // await db.insert(yourTable).values([...]);

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