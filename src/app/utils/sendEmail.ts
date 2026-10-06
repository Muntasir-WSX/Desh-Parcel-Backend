import nodemailer from 'nodemailer';
import { getDynamicEmailTemplate } from './emailTemplate';

interface SendNotificationEmailParams {
  to: string;
  userName: string;
  subject: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const canSendEmail = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials are not configured. Skipping email notification.');
    return false;
  }
  return true;
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!canSendEmail()) return;

  await createTransporter().sendMail({
    from: `"DeshParcel Logistics" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendNotificationEmail = async ({
  to,
  userName,
  subject,
  title,
  message,
  actionText,
  actionUrl,
}: SendNotificationEmailParams) => {
  if (!canSendEmail()) return;

  const htmlContent = getDynamicEmailTemplate(userName, title, message, actionText, actionUrl);

  await createTransporter().sendMail({
    from: `"DeshParcel Logistics" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
};