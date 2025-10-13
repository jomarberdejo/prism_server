
import { setSignedCookie, deleteCookie, getCookie } from "hono/cookie";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { COOKIE_CONFIG, COOKIE_NAMES, JWT_SECRET } from "@/constants/cookies";
import { BadRequestError } from "@/utils/error";
import {
  registerUser,
  loginUser,
  createUserSession,
  destroySession,
} from "@/services/auth";

export const register = async (c: Context) => {
  const { email, password, name } = await c.req.json();

  if (!email || !password || !name) {
    throw new BadRequestError("Missing required fields");
  }

  await registerUser(email, password, name);

  return c.json(
    { message: "User created successfully" },
    StatusCodes.CREATED
  );
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    throw new BadRequestError("Missing email or password");
  }

  const user = await loginUser(email, password);

  const token = await createUserSession(user.id, user.email, user.role);

  await setSignedCookie(
    c,
    COOKIE_NAMES.accessToken,
    token,
    JWT_SECRET,
    COOKIE_CONFIG
  );

  return c.json(
    {
      message: "Logged in successfully",
      user: { id: user.id, email: user.email, role: user.role },
    },
    StatusCodes.OK
  );
};

export const logout = async (c: Context) => {
  const token = getCookie(c, COOKIE_NAMES.accessToken);

  if (token) {
    await destroySession(token);
  }

  deleteCookie(c, COOKIE_NAMES.accessToken, COOKIE_CONFIG);

  return c.json({ message: "Logged out successfully" }, StatusCodes.OK);
};

export const getCurrentUser = async (c: Context) => {
  const user = (c as any).user;
  return c.json(user, StatusCodes.OK);
};

