import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { COOKIE_NAMES } from "@/constants/cookies";
import { getRefreshTokenByToken } from "@/data/refreshToken";
import { verifyAccessToken } from "@/services/auth";
import { UnauthorizedError } from "@/utils/error";

export const authMiddleware = async (c: Context, next: Next) => {
  const accessToken = getCookie(c, COOKIE_NAMES.accessToken);
  console.log("access", accessToken);
  if (!accessToken) {
    throw new UnauthorizedError("Unauthorized");
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    throw new UnauthorizedError("Invalid token");
  }

  const { userId, email, role } = payload as {
    userId: string;
    email: string;
    role: string;
  };

  const user = {
    id: userId,
    email: email,
    role: role,
  };

  c.set("user", user);
  await next();
};
