import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { getOtpEmailTemplate } from '../../utils/emailTemplate';
import redisClient from '../../config/redis'; 

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getUserProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      riderProfile: true,
    },
  });

  if (!user) throw new Error('User not found!');
  return user;
};

const updateMyProfileIntoDB = async (
  userId: string,
  payload: { name?: string; phone?: string; email?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found!');

  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      phone: payload.phone,
      email: payload.email?.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      riderProfile: true,
    },
  });
};


const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User with this email does not exist!');

  const cooldown = await redisClient.get(`cooldown:${email}`);
  if (cooldown) {
    throw new Error('Please wait 90 seconds before requesting a new OTP.');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 
  

  await redisClient.set(`otp:${email}`, otpCode, {
    EX: 300,
  });

  await redisClient.set(`cooldown:${email}`, '1', {
    EX: 90,
  });

  const ttlSeconds = await redisClient.ttl(`otp:${email}`);
  console.log(` Redis OTP Cache Timing: ${ttlSeconds} seconds remaining for ${email}`);
 
  await transporter.sendMail({
    from: `"DeshParcel Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: ' Password Reset OTP - DeshParcel',
    html: getOtpEmailTemplate(user.name, otpCode),
  });

  return { message: 'OTP sent to your email. Please check your inbox.' };
};


const resetPassword = async (payload: { email: string; otp: string; newPassword: string }) => {
  const { email, otp, newPassword } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found!');

  const storedOtp = await redisClient.get(`otp:${email}`);


  if (!storedOtp || storedOtp !== otp) {
    throw new Error('Invalid or expired OTP!');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);


  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

 
  await redisClient.del(`otp:${email}`);

  return { message: 'Password reset successfully!' };
};

export const UserServices = {
  getUserProfileFromDB,
  updateMyProfileIntoDB,
  forgotPassword,
  resetPassword,
};