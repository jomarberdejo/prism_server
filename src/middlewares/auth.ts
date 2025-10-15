import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

import { UnauthorizedError, ForbiddenError } from "@/utils/error";
import type { UserPayload } from "@/types/auth";
import { sessionRepository } from "@/data/session";
import { authService } from "@/services/auth";
import { COOKIE_NAMES } from "@/constants/cookies";

declare global {
  namespace HonoRequest {
    interface HonoContextVariables {
      user: UserPayload;
    }
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, COOKIE_NAMES.accessToken);



  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  const session = await sessionRepository.findByToken(token);
  console.log(session)
  if (!session || new Date() > session.expiresAt) {
    throw new UnauthorizedError("Session expired or invalid");
  }

  const payload = await authService.verifyToken(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid token");
  }

  const user: UserPayload = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  c.set("user", user);
  await next();
};

export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as UserPayload | undefined;

    console.log(user)

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  };
};