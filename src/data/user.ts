import prisma from "@/lib/prisma";
import type { Prisma, ROLE, User, USER_STATUS } from "@prisma/client";

const userSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  isDepartmentHead: true,
  pushToken: true,
  status: true,
} as const;

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async create(
    email: string,
    hashedPassword: string,
    name: string,
    isDepartmentHead: boolean,
    role: ROLE,
  ) {
    return prisma.user.create({
      data: { email, password: hashedPassword, name, isDepartmentHead, role },
      select: userSelect,
    });
  },

  async findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        ...userSelect,
        departmentHead: true,
        sessions: {
          select: {
            id: true,
            createdAt: true,
            token: true,
          },
        },
      },
      
    });
  },

  async findByRole(role: ROLE) {
    return prisma.user.findMany({
      where: { role },
      select: userSelect,
    });
  },

  async updateProfile(id: string, profileData: User) {
    return prisma.user.update({
      where: { id },
      data: profileData,
      select: userSelect,
    });
  },

  async updateRole(id: string, role: ROLE) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    });
  },

  async updateStatus(id: string, status: USER_STATUS) {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: userSelect,
    });
  },

  

  async updatePushToken(email: string, pushToken: string) {
    return prisma.user.update({
      where: { email },
      data: { pushToken },
      select: userSelect,
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },

  async updateDepartmentHeadStatus(userId: string, isDepartmentHead: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isDepartmentHead },
    });
  },

  async getDepartmentHeads() {
    return prisma.user.findMany({
      where: { isDepartmentHead: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentHead: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
};
