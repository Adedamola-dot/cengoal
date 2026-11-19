import { z } from 'zod';
import { ROLES, COURSE_LEVELS } from '@cpe-os/shared';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(ROLES).optional(),
    level: z.number().refine((val) => COURSE_LEVELS.includes(val as any), {
      message: 'Invalid course level',
    }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});