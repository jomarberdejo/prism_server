import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { COOKIE_NAMES } from "@/constants/cookies";
import { getSessionByToken } from "@/data/session";
import { verifyToken } from "@/services/auth";
import { UnauthorizedError } from "@/utils/error";

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, COOKIE_NAMES.accessToken);

  if (!token) {
    throw new UnauthorizedError("Unauthorized");
  }

  const session = await getSessionByToken(token);

  if (!session || new Date() > session.expiresAt) {
    throw new UnauthorizedError("Session expired");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid token");
  }

  (c as any).user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  await next();
};
