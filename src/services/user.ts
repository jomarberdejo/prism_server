import { VALID_ROLES } from "@/constants/roles";
import { userRepository } from "@/data/user";
import { ROLE } from "@/generated/prisma";
import { NotFoundError, BadRequestError } from "@/utils/error";


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

  async updateUserRole(userId: string, role: ROLE) {
    if (!VALID_ROLES.includes(role as any)) {
      throw new BadRequestError("Invalid role");
    }

    const user = await this.getUserById(userId);
    return userRepository.updateRole(userId, role);
  },


  async deleteUser(id: string) {
    await this.getUserById(id);
    return userRepository.delete(id);
  },
};
