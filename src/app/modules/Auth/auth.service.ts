import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}

interface LoginPayload {
  email: string;
  password: string;
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

const loginUserFromDB = async (payload: LoginPayload) => {
  const { email, password } = payload;


  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found! Please register first.');
  }


  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Invalid email or password!');
  }

 
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '7d' }
  );
  const { password: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    user: userWithoutPassword,
  };
};



export const AuthServices = {
  registerUserIntoDB,
  loginUserFromDB,
};