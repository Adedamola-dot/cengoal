import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, COURSE_LEVELS } from '@cpe-os/shared';
import type { Role, CourseLevel } from '@cpe-os/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  level?: CourseLevel;
  department: string;
  isVerified: boolean;
  reputationPoints: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, 
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'student',
    },
    level: {
      type: Number,
      enum: COURSE_LEVELS,
    },
    department: {
      type: String,
      default: 'Computer Engineering',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    reputationPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);