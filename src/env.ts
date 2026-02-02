import {z} from 'zod';
import { NODE_ENV } from '@/constants/env';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    NODE_ENV: z.nativeEnum(NODE_ENV).default(NODE_ENV.Local),
    APP_PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string(),
})

export const envConfig = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
})

export type EnvConfig = z.infer<typeof envSchema>;


