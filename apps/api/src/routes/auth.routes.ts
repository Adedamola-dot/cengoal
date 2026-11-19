import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

// Route: POST /api/v1/auth/register
router.post('/register', validate(registerSchema), register);

// Route: POST /api/v1/auth/login
router.post('/login', validate(loginSchema), login);

export const authRoutes = router;