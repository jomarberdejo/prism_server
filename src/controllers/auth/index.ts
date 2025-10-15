import {
  deleteCookie,
  getCookie,
  setCookie,
} from "hono/cookie";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/utils/error";
import { authService } from "@/services/auth";
import { COOKIE_CONFIG, COOKIE_NAMES } from "@/constants/cookies";

export const authHandler = {
  async register(c: Context) {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await authService.register(email, password, name);

    return c.json(
      {
        success: true,
        message: "User registered successfully",
        data: { user },
      },
      StatusCodes.CREATED
    );
  },

  async login(c: Context) {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      throw new BadRequestError("Email and password required");
    }

    const user = await authService.login(email, password);
    const token = await authService.createSession(
      user.id,
      user.email,
      user.role
    );

    setCookie(c, COOKIE_NAMES.accessToken, token, COOKIE_CONFIG);

    return c.json(
      {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      },
      StatusCodes.OK
    );
  },

  async logout(c: Context) {
    const token = getCookie(c, COOKIE_NAMES.accessToken);

    if (token) {
      await authService.destroySession(token);
    }

    deleteCookie(c, COOKIE_NAMES.accessToken, COOKIE_CONFIG);

    return c.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      StatusCodes.OK
    );
  },

  async getCurrentUser(c: Context) {
    const user = c.get("user");
    return c.json(
      {
        success: true,
        data: { user },
      },
      StatusCodes.OK
    );
  },
};
