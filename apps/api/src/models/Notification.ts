import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId; // If null, it's a global broadcast
  title: string;
  message: string;
  type: 'material' | 'assignment' | 'system';
  isRead: boolean;
  link?: string; // Where to go when clicked
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['material', 'assignment', 'system'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);