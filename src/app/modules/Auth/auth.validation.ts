import { z } from 'zod';


const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
    email: z.string().trim().email('Please provide a valid email address.'),
    phone: z
      .string()
      .trim()
      .regex(bdPhoneRegex, 'Must be a valid Bangladeshi mobile number starting with 013, 014, 015, 016, 017, 018, or 019.'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .regex(
        strongPasswordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      ),
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