import { prisma } from './prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@supervisor.local' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@supervisor.local',
      password: 'admin123', // TODO: Hash this password in production!
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'user@supervisor.local' },
    update: {},
    create: {
      name: 'Default User',
      email: 'user@supervisor.local',
      password: 'user123', // TODO: Hash this password in production!
      role: 'user',
    },
  });

  console.log('✅ Default user created:', defaultUser.email);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
