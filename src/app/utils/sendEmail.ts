import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials are not configured. Skipping email notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  await transporter.sendMail({
    from: '"DeshParcel & Logistics" <support@deshparcel.com>',
    to,
    subject,
    html: htmlContent,
  });
};