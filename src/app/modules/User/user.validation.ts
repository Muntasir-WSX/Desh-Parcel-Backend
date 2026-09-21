import { z } from 'zod';

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(7).optional(),
    email: z.string().trim().email().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one profile field is required.'),
});

const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().trim().email() }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    otp: z.string().trim().length(6, 'OTP must be 6 digits.'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  }),
});

export const UserValidation = {
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};