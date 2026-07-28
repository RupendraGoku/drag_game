import mongoose from 'mongoose';
import { env } from './environment.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
