import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';
import type { Semester } from '@cpe-os/shared';

export interface IPastQuestion extends Document {
  courseId: mongoose.Types.ObjectId;
  year: number;
  session: string; // e.g., "2022/2023"
  semester: Semester;
  fileUrl: string;
  solutionUrl?: string;
  uploadedBy: mongoose.Types.ObjectId;
  verified: boolean;
  helpfulVotes: mongoose.Types.ObjectId[]; // Array of User IDs who voted
}

const pastQuestionSchema = new Schema<IPastQuestion>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      enum: ['first', 'second'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    solutionUrl: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Performance optimization: Index the search fields so queries are lightning fast
pastQuestionSchema.index({ courseId: 1, year: -1, session: 1 });

export const PastQuestion = mongoose.model<IPastQuestion>('PastQuestion', pastQuestionSchema);