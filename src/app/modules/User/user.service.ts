import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { getOtpEmailTemplate } from '../../utils/emailTemplate';

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


const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User with this email does not exist!');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // ৬ ডিজিটের ওটিপি
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিট মেয়াদ

 
  await prisma.otp.create({
    data: {
      userId: user.id,
      otpCode,
      type: 'FORGOT_PASSWORD',
      expiresAt,
    },
  });

 
  await transporter.sendMail({
   from: `"DeshParcel Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Password Reset OTP - DeshParcel',
    html: getOtpEmailTemplate(user.name, otpCode), 
  });

    return { message: 'OTP sent to your email. Please check your inbox.' };

  
};

const resetPassword = async (payload: { email: string; otp: string; newPassword: string }) => {
  const { email, otp, newPassword } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found!');

  const validOtp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otpCode: otp,
      type: 'FORGOT_PASSWORD',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!validOtp || validOtp.expiresAt < new Date()) {
    throw new Error('Invalid or expired OTP!');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

 
  await prisma.otp.delete({ where: { id: validOtp.id } });

  return { message: 'Password reset successfully!' };
};

export const UserServices = {
  getUserProfileFromDB,
  forgotPassword,
  resetPassword,
};