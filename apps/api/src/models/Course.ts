import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';
import type { CourseLevel, Semester } from '@cpe-os/shared';

export interface ICourse extends Document {
  code: string; // e.g., CPE301
  title: string; // e.g., Logic Design
  level: CourseLevel;
  semester: Semester;
  outline: string;
  lecturer?: string;
  effortVotes: number[];
}

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      enum: ['first', 'second'],
      required: true,
    },
    outline: {
      type: String,
      default: 'Course outline not uploaded yet.',
    },
    lecturer: {
      type: String,
      default: 'To be assigned',
    },
    effortVotes: {
      type: [Number], // Array of votes (1-5) to calculate average effort
      default: [],
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', courseSchema);