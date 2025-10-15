import { STAGES } from '@/constants/env';
import {z} from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    STAGE: z.nativeEnum(STAGES).default('local'),
    APP_PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string(),
})

export const envConfig = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    STAGE: process.env.STAGE,
    APP_PORT: process.env.APP_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
})

export type EnvConfig = z.infer<typeof envSchema>;