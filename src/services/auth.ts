
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from "@/utils/error";
import type { TokenPayload, UserPayload } from "@/types/auth";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { userRepository } from "@/data/user";
import { sessionRepository } from "@/data/session";
import { envConfig } from "@/env";

export const authService = {
  generateToken(payload: TokenPayload): Promise <string> {
    return sign(payload, envConfig.JWT_SECRET, "HS256");
  },

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await verify(token, envConfig.JWT_SECRET, "HS256");
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      return null;
    }
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  async register(email: string, password: string, name: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const hashedPassword = await this.hashPassword(password);
    return userRepository.create(email, hashedPassword, name);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }


    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return user;
  },

  async createSession(
    userId: string,
    email: string,
    role: string
  ): Promise<string> {
    await sessionRepository.deleteByUserId(userId);

    const token = await this.generateToken({ userId, email, role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sessionRepository.create(userId, token, expiresAt);
    return token;
  },

  async destroySession(token: string) {
    return sessionRepository.deleteByToken(token);
  },
};