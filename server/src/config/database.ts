import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let connection: typeof mongoose | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (connection) return connection;

  mongoose.set('strictQuery', true);

  // Same options the Next.js app used, preserving identical driver behaviour.
  connection = await mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
    autoIndex: false,
  });

  logger.info('MongoDB connected');
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  if (!connection) return;
  await mongoose.disconnect();
  connection = null;
  logger.info('MongoDB disconnected');
}
