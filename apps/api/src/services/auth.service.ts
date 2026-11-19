import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
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
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409); // 409 Conflict
    }

    // 2. Create the user (Mongoose pre-save hook hashes the password automatically)
    const user = await userRepository.create(data);

    // 3. Generate tokens
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 4. Strip password from the returned user object
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken };
  }

  async login(email: string, candidatePassword: string): Promise<AuthResponse> {
    // 1. Find user and explicitly select the password field
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Check password using the custom method we defined in the User model
    const isPasswordCorrect = await user.comparePassword(candidatePassword);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate tokens
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 4. Strip password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken };
  }
}

export const authService = new AuthService();