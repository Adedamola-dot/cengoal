import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IMaterial extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  deliveryLog: {
    inAppSeenBy: mongoose.Types.ObjectId[]; // Array of user IDs who opened it
    emailSentCount: number;
    whatsappPosted: boolean;
  };
}

const materialSchema = new Schema<IMaterial>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryLog: {
      inAppSeenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      emailSentCount: { type: Number, default: 0 },
      whatsappPosted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Material = mongoose.model<IMaterial>('Material', materialSchema);