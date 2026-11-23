import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { IUser } from '../models/User.js';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role?: any;
  level?: any;
}

interface AuthResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const user = await userRepository.create(data);
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken };
  }

  async login(email: string, candidatePassword: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordCorrect = await user.comparePassword(candidatePassword);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken };
  }

  // 🔥 NEW: Handle token refresh
  async refresh(oldRefreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = verifyRefreshToken(oldRefreshToken);
      const user = await userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new AppError('User not found', 401);
      }

      const payload = { userId: user._id.toString(), role: user.role };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);

      const userObj = user.toObject();
      delete userObj.password;

      return { user: userObj, accessToken, refreshToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }
}

export const authService = new AuthService();