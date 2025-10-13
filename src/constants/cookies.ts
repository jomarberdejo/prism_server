export const COOKIE_NAMES = {
  accessToken: "accessToken",
} as const;

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "prod",
  sameSite: "Lax" as const,
  maxAge: 7 * 24 * 60 * 60,
  path: "/",
} as const;

export const JWT_SECRET = process.env.JWT_SECRET || "prism_app_secret";