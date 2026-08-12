import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  PORT: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().default(3000)),
  MONGO_URI: isTest
    ? z.string().default('mongodb://localhost:27017/test')
    : z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: isTest
    ? z.string().default('dummy_access_secret')
    : z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: isTest
    ? z.string().default('dummy_refresh_secret')
    : z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);
}

export const env = result.data;
