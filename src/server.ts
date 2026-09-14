import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // Test Database Connection
    await prisma.$connect();
    console.log("DeshParcel Database connected successfully!");

    app.listen(PORT, () => {
      console.log(` DeshParcel Server is running smoothly on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();