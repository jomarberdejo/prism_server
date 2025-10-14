import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "@/constants/cookies";
import { getUserByEmail, createUser as createUserData } from "@/data/user";
import {
  createRefreshTokenRecord,
  getRefreshTokenByToken,
  deleteRefreshTokenByToken,
  deleteRefreshTokensByUserId,
} from "@/data/refreshToken";
import { ConflictError, UnauthorizedError } from "@/utils/error";
import { JWTPayload } from "hono/utils/jwt/types";

export const generateAccessToken = (payload: JWTPayload) => {
  return sign({ ...payload, type: "access" }, JWT_SECRET, "HS256");
};

export const generateRefreshToken = (userId: string) => {
  return sign({ userId, type: "refresh" }, REFRESH_TOKEN_SECRET, "HS256");
};

export const verifyAccessToken = (
  token: string
): Promise<JWTPayload> | null => {
  try {
    return verify(token, JWT_SECRET, "HS256");
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): Promise<JWTPayload> | null => {
  try {
    return verify(token, REFRESH_TOKEN_SECRET, "HS256");
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  return createUserData(email, hashedPassword, name);
};

export const loginUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  return user;
};

export const createTokenPair = async (
  userId: string,
  email: string,
  role: string
) => {
  await deleteRefreshTokensByUserId(userId);

  const accessToken = await generateAccessToken({ userId, email, role });
  const refreshToken = await generateRefreshToken(userId);

  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshTokenRecord(userId, refreshToken, refreshTokenExpiresAt);

  return { accessToken, refreshToken };
};

export const rotateTokens = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return null;
  }

  const storedToken = await getRefreshTokenByToken(refreshToken);

  if (!storedToken || new Date() > storedToken.expiresAt) {
    if (storedToken) {
      await deleteRefreshTokenByToken(refreshToken);
    }
    return null;
  }

  const user = storedToken.user;

  // Create new token pair
  return createTokenPair(user.id, user.email, user.role);
};

export const destroyRefreshToken = async (token: string) => {
  return deleteRefreshTokenByToken(token);
};
