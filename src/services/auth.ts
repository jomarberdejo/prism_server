import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from "@/utils/error";
import type { TokenPayload } from "@/types/auth";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { userRepository } from "@/data/user";
import { sessionRepository } from "@/data/session";
import { envConfig } from "@/config/env";
import { USER_STATUS, type ROLE } from "@prisma/client";
import { mailer } from "@/lib/mailer";

export const authService = {
  generateToken(payload: TokenPayload): Promise<string> {
    return sign(payload, envConfig.JWT_SECRET!, "HS256");
  },

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await verify(token, envConfig.JWT_SECRET!, "HS256");
      return {
        userId: payload.userId as string,
        username: payload.username as string,
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

  async register(
    password: string,
    name: string,
    username: string,
    isDepartmentHead: boolean,
    role: ROLE,
    email?: string
  ) {
    if (email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError("Email already in use");
      }
    }

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already in use");
    }

    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await userRepository.create(
      hashedPassword,
      name,
      isDepartmentHead,
      role,
      username,
      email
    );

    if (email) {
      try {
        await mailer.sendStatusUpdate(email, name, USER_STATUS.PENDING);
      } catch (err) {
        console.error("Failed to send registration email:", err);
      }
    }

    return user;
  },

  async login(username: string, password: string, pushToken?: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.status === USER_STATUS.PENDING) {
      throw new UnauthorizedError("Account is pending approval");
    }
    if (user.status === USER_STATUS.REJECTED) {
      throw new UnauthorizedError("Account is rejected");
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (pushToken) {
      await userRepository.updatePushToken(username, pushToken);
    }

    return user;
  },

  async createSession(
    userId: string,
    username: string,
    role: string
  ): Promise<string> {
    await sessionRepository.deleteByUserId(userId);

    const token = await this.generateToken({ userId, username, role });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sessionRepository.create(userId, token, expiresAt);
    return token;
  },

  async destroySession(token: string) {
    return sessionRepository.deleteByToken(token);
  },
};
