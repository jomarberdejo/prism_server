export const COOKIE_NAMES = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.STAGE === "prod",
  sameSite: "Lax" as const,
  path: "/",
} as const;

export const ACCESS_TOKEN_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: ACCESS_TOKEN_EXPIRY,
} as const;

export const REFRESH_TOKEN_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: REFRESH_TOKEN_EXPIRY,
} as const;

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key";


  
  