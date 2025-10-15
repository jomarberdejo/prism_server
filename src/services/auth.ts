import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { JWT_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "@/constants/cookies";
import { getUserByEmail, createUser as createUserData } from "@/data/user";
import {
  createRefreshTokenRecord,
  getRefreshTokenByToken,
  deleteRefreshTokenByToken,
  deleteRefreshTokensByUserId,
} from "@/data/refreshToken";
import { ConflictError, UnauthorizedError } from "@/utils/error";
import type { JWTPayload } from "hono/utils/jwt/types";

/* -------------------------------------------------------------------------- */
/*                            TOKEN GENERATION HELPERS                        */
/* -------------------------------------------------------------------------- */

export const generateAccessToken = async (payload: JWTPayload) => {
  return await sign(
    { ...payload, type: "access", exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY },
    JWT_SECRET,
    "HS256"
  );
};

export const generateRefreshToken = async (userId: string) => {
  return await sign(
    { userId, type: "refresh", exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY },
    REFRESH_TOKEN_SECRET,
    "HS256"
  );
};

/* -------------------------------------------------------------------------- */
/*                              TOKEN VERIFICATION                            */
/* -------------------------------------------------------------------------- */

export const verifyAccessToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    return await verify(token, JWT_SECRET, "HS256");
  } catch {
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    return await verify(token, REFRESH_TOKEN_SECRET, "HS256");
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                            PASSWORD UTILITIES                              */
/* -------------------------------------------------------------------------- */

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/* -------------------------------------------------------------------------- */
/*                              AUTHENTICATION                                */
/* -------------------------------------------------------------------------- */

export const registerUser = async (email: string, password: string, name: string) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) throw new ConflictError("User already exists");

  const hashedPassword = await hashPassword(password);
  return createUserData(email, hashedPassword, name);
};

export const loginUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

  return user;
};

/* -------------------------------------------------------------------------- */
/*                             TOKEN MANAGEMENT                               */
/* -------------------------------------------------------------------------- */

export const createTokenPair = async (userId: string, email: string, role: string) => {
  // Remove previous refresh tokens (optional but secure)
  await deleteRefreshTokensByUserId(userId);

  const accessToken = await generateAccessToken({ userId, email, role });
  const refreshToken = await generateRefreshToken(userId);

  // store refresh token in DB
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);
  await createRefreshTokenRecord(userId, refreshToken, expiresAt);

  return { accessToken, refreshToken };
};

export const rotateTokens = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  const payload = await verifyRefreshToken(refreshToken); // ← added await

  if (!payload || payload.type !== "refresh") return null;

  const storedToken = await getRefreshTokenByToken(refreshToken);
  if (!storedToken || new Date() > storedToken.expiresAt) {
    if (storedToken) await deleteRefreshTokenByToken(refreshToken);
    return null;
  }

  const user = storedToken.user;
  return await createTokenPair(user.id, user.email, user.role);
};

export const destroyRefreshToken = async (token: string) => {
  return deleteRefreshTokenByToken(token);
};
