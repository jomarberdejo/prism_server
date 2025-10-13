
import {sign, verify} from "hono/jwt";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "@/constants/cookies";
import { getUserByEmail, createUser as createUserData } from "@/data/user";
import { createSessionRecord, deleteSessionByToken, deleteSessionsByUserId } from "@/data/session";
import { ConflictError, UnauthorizedError } from "@/utils/error";
import { JWTPayload } from "hono/utils/jwt/types";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): Promise <string> => {
  return sign(payload, JWT_SECRET, "HS256");
};

export const verifyToken = (token: string): Promise <JWTPayload> | null => {
  try {
    return verify(token, JWT_SECRET, "HS256");
  } catch {
    return null;
  }
};

export const hashPassword =  (password: string): Promise<string> => {
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

export const createUserSession = async (
  userId: string,
  email: string,
  role: string
) => {
  await deleteSessionsByUserId(userId);

  const token = await generateToken({ userId, email, role });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createSessionRecord(userId, token, expiresAt);

  return token;
};

export const destroySession = async (token: string) => {
  return deleteSessionByToken(token);
};

