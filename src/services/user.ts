import { VALID_ROLES } from "@/constants/roles";
import { VALID_STATUSES } from "@/constants/status";
import { userRepository } from "@/data/user";
import { NotFoundError, BadRequestError } from "@/utils/error";
import { type USER_STATUS, type ROLE } from "@prisma/client";

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
  }
};
