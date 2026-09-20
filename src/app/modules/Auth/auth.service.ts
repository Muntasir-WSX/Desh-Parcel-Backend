import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PROTECTED_ADMIN_EMAIL } from '../../config/admin';

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
  nidNumber?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const registerUserIntoDB = async (payload: RegisterPayload) => {
  const {
    name,
    email,
    phone,
    password,
    role = 'CUSTOMER',
    vehicleType,
    vehicleNumber,
    licenseNumber,
    nidNumber,
  } = payload;

  if (!['CUSTOMER', 'RIDER'].includes(role) || email.toLowerCase() === PROTECTED_ADMIN_EMAIL) {
    throw new Error('Only customer or rider accounts can be created through public registration.');
  }

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
      if (!vehicleType || !vehicleNumber || !licenseNumber || !nidNumber) {
        throw new Error('Vehicle and NID details are required for rider registration!');
      }

      await tx.riderProfile.create({
        data: {
          userId: newUser.id,
          vehicleType,
          vehicleNumber,
          licenseNumber,
          nidNumber,
          totalBalance: 0,
          withdrawn: 0,
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

  if (user.isBanned) {
    throw new Error('This account has been banned by an administrator.');
  }

  if (user.role === 'ADMIN' && user.email.toLowerCase() !== PROTECTED_ADMIN_EMAIL) {
    throw new Error('This admin account is not authorized.');
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