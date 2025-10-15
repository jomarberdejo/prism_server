
import { setSignedCookie, deleteCookie, getCookie, getSignedCookie } from "hono/cookie";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import {
  ACCESS_TOKEN_COOKIE_CONFIG,
  REFRESH_TOKEN_COOKIE_CONFIG,
  COOKIE_NAMES,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "@/constants/cookies";
import { BadRequestError, UnauthorizedError } from "@/utils/error";
import {
  registerUser,
  loginUser,
  createTokenPair,
  rotateTokens,
  destroyRefreshToken,
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

  const { accessToken, refreshToken } = await createTokenPair(
    user.id,
    user.email,
    user.role
  );

  await setSignedCookie(
    c,
    COOKIE_NAMES.accessToken,
    accessToken,
    JWT_SECRET,
    ACCESS_TOKEN_COOKIE_CONFIG
  );

  await setSignedCookie(
    c,
    COOKIE_NAMES.refreshToken,
    refreshToken,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_COOKIE_CONFIG
  );

  return c.json(
    {
      message: "Logged in successfully",
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
    StatusCodes.OK
  );

};

export const refresh = async (c: Context) => {

  const refreshToken = await getSignedCookie(c, REFRESH_TOKEN_SECRET, COOKIE_NAMES.refreshToken);




  if (!refreshToken) {
    throw new BadRequestError("Refresh token missing");
  }

  const tokens = await rotateTokens(refreshToken);

  if (!tokens) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  await setSignedCookie(
    c,
    COOKIE_NAMES.accessToken,
    tokens.accessToken,
    JWT_SECRET,
    ACCESS_TOKEN_COOKIE_CONFIG
  );

  await setSignedCookie(
    c,
    COOKIE_NAMES.refreshToken,
    tokens.refreshToken,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_COOKIE_CONFIG
  );

  return c.json({ message: "Tokens refreshed successfully" }, StatusCodes.OK);
};

export const logout = async (c: Context) => {
  const refreshToken = getCookie(c, COOKIE_NAMES.refreshToken);

  if (refreshToken) {
    await destroyRefreshToken(refreshToken);
  }

  deleteCookie(c, COOKIE_NAMES.accessToken, ACCESS_TOKEN_COOKIE_CONFIG);
  deleteCookie(c, COOKIE_NAMES.refreshToken, REFRESH_TOKEN_COOKIE_CONFIG);

  return c.json({ message: "Logged out successfully" }, StatusCodes.OK);
};

export const getCurrentUser = async (c: Context) => {
  const user = c.get("user") as { userId: string; email: string; role: string };
  return c.json(user, StatusCodes.OK);
};