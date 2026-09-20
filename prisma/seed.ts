import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@deshparcel.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set before running the seed.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: process.env.ADMIN_NAME || 'DeshParcel Admin',
      phone: process.env.ADMIN_PHONE || '01700000000',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      isBanned: false,
    },
    create: {
      name: process.env.ADMIN_NAME || 'DeshParcel Admin',
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || '01700000000',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      isBanned: false,
    },
  });

  console.log('Protected admin account is ready:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });