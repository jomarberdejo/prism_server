import { VALID_ROLES } from "@/constants/roles";
import { VALID_STATUSES } from "@/constants/status";
import { userRepository } from "@/data/user";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "@/utils/error";
import { type USER_STATUS, type ROLE } from "@prisma/client";
import { authService } from "./auth";

export const userService = {
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  async getAllUsers() {
    return userRepository.findAll();
  },

  async getUsersByRole(role: ROLE) {
    if (!VALID_ROLES.includes(role as any)) {
      throw new BadRequestError("Invalid role");
    }
    return userRepository.findByRole(role);
  },

  async updateProfile(userId: string, profileData: any) {
    return userRepository.updateProfile(userId, profileData);
  },

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValidPassword = await authService.comparePassword(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new BadRequestError("Current password is incorrect");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }

    const isSamePassword = await authService.comparePassword(
      newPassword,
      user.password
    );
    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from current password"
      );
    }

    const hashedPassword = await authService.hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashedPassword);
  },

  async updateUserRole(userId: string, role: ROLE) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestError("Invalid role");
    }

    const user = await this.getUserById(userId);
    return userRepository.updateRole(userId, role);
  },

  async updateUserStatus(userId: string, status: USER_STATUS) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError("Invalid status");
    }

    const user = await this.getUserById(userId);
    return userRepository.updateStatus(userId, status);
  },

  async updateDepartmentHeadStatus(userId: string, isDepartmentHead: boolean) {
    const user = await this.getUserById(userId);
    return userRepository.updateDepartmentHeadStatus(userId, isDepartmentHead);
  },

  async deleteUser(id: string) {
    await this.getUserById(id);
    return userRepository.delete(id);
  },

  async getAllDepartmentHeads() {
    const users = await userRepository.getDepartmentHeads();
    const mappedUsers = users.map((user) => ({
      label: user.name,
      value: user.id,
    }));

    return mappedUsers;
  },
};
