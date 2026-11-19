import { User } from '../models/User.js';
import type { IUser } from '../models/User.js';

export class UserRepository {
  // Find user by email. We explicitly request the password field 
  // because it's set to select: false in the schema.
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password');
  }

  // Create a new user
  async create(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  // Find user by ID (used later for profile fetching)
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }
}

// Export a single instance to be used across the app
export const userRepository = new UserRepository();