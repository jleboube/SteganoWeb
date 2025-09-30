import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const requestResetSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1)
});

const modeSchema = z
  .preprocess((value) => (typeof value === 'string' ? value.toUpperCase() : value), z.enum(['ALGORITHM', 'AI']))
  .default('ALGORITHM');

export const checkoutSessionSchema = z.object({
  packageType: z.enum(['PACK_25', 'PACK_50', 'PACK_100'])
});

export const encodeRequestSchema = z.object({
  message: z
    .string()
    .min(1)
    .max(1000)
    .transform((value) => value.trim()),
  prompt: z
    .preprocess((value) => (typeof value === 'string' ? value.trim() : value), z.string().max(500))
    .optional(),
  mode: modeSchema
});

export const decodeRequestSchema = z.object({
  mode: modeSchema
});

export const nanoBananaOptionsSchema = z.object({
  prompt: z.string().max(280).optional()
});
