import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PROTECTED_ADMIN_EMAIL } from '../../config/admin';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

interface GoogleLoginPayload {
  idToken: string;
  phone: string;
}

const createAccessToken = (user: { id: string; email: string; role: Role }) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

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
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

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

  const accessToken = createAccessToken(tokenPayload);
  const { password: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    user: userWithoutPassword,
  };
};

const loginWithGoogle = async (payload: GoogleLoginPayload) => {
  const { idToken, phone } = payload;

  if (!idToken) {
    throw new Error('Google ID Token is required!');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const googlePayload = ticket.getPayload();

  if (!googlePayload || !googlePayload.email) {
    throw new Error('Invalid Google Token!');
  }

  const email = googlePayload.email;
  const name = googlePayload.name || 'Google User';

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    if (!phone) {
      throw new Error('Phone number is required for first-time registration via Google!');
    }

    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: '',
        role: 'CUSTOMER',
        isVerified: true,
      },
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '1d' }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const logoutUser = async () => {
  return { loggedOut: true };
};



export const AuthServices = {
  registerUserIntoDB,
  loginUserFromDB,
  loginWithGoogle,
  logoutUser,
};