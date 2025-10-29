import { ForbiddenError } from "@/utils/error";
import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";

export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = (c as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  };
};
