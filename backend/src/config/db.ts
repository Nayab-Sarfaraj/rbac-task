import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error({ error }, '❌ MongoDB connection error');
    process.exit(1);
  }
};
