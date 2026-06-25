import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Define environment variable schema using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  PG_HOST: z.string().default('localhost'),
  PG_PORT: z.coerce.number().default(5432),
  PG_USER: z.string(),
  PG_PASSWORD: z.string(),
  PG_DB: z.string(),
  MONGO_URI: z.string().regex(/^mongodb(\+srv)?:\/\/.+$/, {
    message: 'Must be a valid MongoDB connection URI (starting with mongodb:// or mongodb+srv://)',
  }),
  VALKEY_HOST: z.string().default('localhost'),
  VALKEY_PORT: z.coerce.number().default(6379),
  VALKEY_PASSWORD: z.string().optional().default(''),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Configuration error! The environment variables are invalid:');
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

const env = parseResult.data;

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  log: {
    level: env.LOG_LEVEL,
  },
  postgres: {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DB,
  },
  mongo: {
    uri: env.MONGO_URI,
  },
  valkey: {
    host: env.VALKEY_HOST,
    port: env.VALKEY_PORT,
    password: env.VALKEY_PASSWORD,
  },
} as const;

export type Config = typeof config;
export default config;
