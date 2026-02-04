import { envConfig } from "@/config/env";

export const COOKIE_NAMES = {
  accessToken: "accessToken",
} as const;

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax" as const,
  maxAge: 7 * 24 * 60 * 60,
  path: "/",
} as const;

export const JWT_SECRET = envConfig.JWT_SECRET;
