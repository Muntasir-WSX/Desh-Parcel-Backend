import { z } from 'zod';

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
    email: z.string().trim().email('Please provide a valid email address.'),
    phone: z.string().trim().min(7, 'Please provide a valid phone number.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    role: z.enum(['CUSTOMER', 'RIDER']).optional(),
    vehicleType: z.string().trim().optional(),
    vehicleNumber: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    nidNumber: z.string().trim().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().trim().min(1, 'Google ID token is required.'),
    phone: z.string().trim().min(7, 'Phone number is required.'),
  }),
});

export const AuthValidation = {
  registerSchema,
  loginSchema,
  googleLoginSchema,
};