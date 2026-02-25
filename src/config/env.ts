import {z} from 'zod';
import { NODE_ENV } from '@/constants/env';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    NODE_ENV: z.nativeEnum(NODE_ENV).default(NODE_ENV.Local),
    APP_PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string(),
    SERVICE_ACCOUNT_JSON: z.string(),
    RESEND_API_KEY: z.string(),
    RESEND_DOMAIN: z.string(),
})

export const envConfig = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    SERVICE_ACCOUNT_JSON: process.env.SERVICE_ACCOUNT_JSON,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_DOMAIN: process.env.RESEND_DOMAIN,
})

export type EnvConfig = z.infer<typeof envSchema>;


