import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: Role; // CUSTOMER বা RIDER হতে পারে
  vehicleType?: string; // রাইডার হলে লাগবে
  vehicleNumber?: string;
  licenseNumber?: string;
}

const registerUserIntoDB = async (payload: RegisterPayload) => {
  const { name, email, phone, password, role = 'CUSTOMER', vehicleType, vehicleNumber, licenseNumber } = payload;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists!');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      },
    });

    
    if (role === 'RIDER') {
      if (!vehicleType || !vehicleNumber || !licenseNumber) {
        throw new Error('Vehicle details are required for rider registration!');
      }

      await tx.riderProfile.create({
        data: {
          userId: newUser.id,
          vehicleType,
          vehicleNumber,
          licenseNumber,
        },
      });
    }

    return newUser;
  });

  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

export const AuthServices = {
  registerUserIntoDB,
};