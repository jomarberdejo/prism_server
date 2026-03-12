import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/utils/error";
import { authService } from "@/services/auth";
import { COOKIE_CONFIG, COOKIE_NAMES } from "@/constants/cookies";
import { userRepository } from "@/data/user";

export const authHandler = {
  async register(c: Context) {
    const { email, password, name, username, isDepartmentHead, role } =
      await c.req.json();

    if (!password || !name || !username) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await authService.register(
      password,
      name,
      username,
      isDepartmentHead,
      role,
      email,
    );
    return c.json(
      {
        success: true,
        message: "User registered successfully",
        data: { user },
      },
      StatusCodes.CREATED,
    );
  },

  async login(c: Context) {
    const { username, password, pushToken } = await c.req.json();

    console.log("LOGIN");

    if (!username || !password) {
      throw new BadRequestError("Username and password required");
    }

    const user = await authService.login(username, password, pushToken);

    console.log("USER LOGIn", user);

    const token = await authService.createSession(
      user.id,
      user.username,
      user.role,
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
      StatusCodes.OK,
    );
  },

  async logout(c: Context) {
    const token = getCookie(c, COOKIE_NAMES.accessToken);
    const user = c.get("user");

    if (token) {
      await authService.destroySession(token);
    }

    if (user?.id) {
      await userRepository.clearPushToken(user.id);
    }

    deleteCookie(c, COOKIE_NAMES.accessToken, COOKIE_CONFIG);

    return c.json(
      { success: true, message: "Logged out successfully" },
      StatusCodes.OK,
    );
  },

  async getCurrentUser(c: Context) {
    const user = c.get("user");
    return c.json(
      {
        success: true,
        data: { user },
      },
      StatusCodes.OK,
    );
  },

  async forgotPassword(c: Context) {
    const { email } = await c.req.json();

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    await authService.sendPasswordResetOTP(email);

    return c.json(
      { success: true, message: "If that email exists, an OTP has been sent." },
      StatusCodes.OK,
    );
  },

  async verifyOTP(c: Context) {
    const { email, otp } = await c.req.json();

    if (!email || !otp) {
      throw new BadRequestError("Email and OTP are required");
    }

    const resetToken = await authService.verifyPasswordResetOTP(email, otp);

    return c.json(
      { success: true, data: { resetToken } },
      StatusCodes.OK,
    );
  },

  async resetPassword(c: Context) {
    const { resetToken, newPassword } = await c.req.json();

    if (!resetToken || !newPassword) {
      throw new BadRequestError("Reset token and new password are required");
    }

    await authService.resetPassword(resetToken, newPassword);

    return c.json(
      { success: true, message: "Password reset successfully" },
      StatusCodes.OK,
    );
  },
};
