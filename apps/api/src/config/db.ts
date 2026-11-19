import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Increase the time to find a server (default is 30 seconds)
      serverSelectionTimeoutMS: 60000, 
      // Increase the socket timeout (default is 0, which can hang)
      socketTimeoutMS: 45000, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};