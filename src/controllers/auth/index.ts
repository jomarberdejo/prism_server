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
    const { email, password, name, username, isDepartmentHead, role } = await c.req.json();

    if (!password || !name || !username) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await authService.register(password, name, username, isDepartmentHead, role, email);
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
    const { username, password, pushToken } = await c.req.json();


    if (!username || !password) {
      throw new BadRequestError("Username and password required");
    }

    const user = await authService.login(username, password, pushToken);

    const token = await authService.createSession(
      user.id,
      user.username,
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
            username: user.username,
            name: user.name,
            role: user.role,
            isDepartmentHead: user.isDepartmentHead,
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