import prisma from "@/lib/prisma";
import { USER_STATUS, type Prisma, type ROLE, type User } from "@prisma/client";

const userSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  role: true,
  createdAt: true,
  isDepartmentHead: true,
  pushToken: true,
  status: true,
  password: true,
} as const;

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  async findActiveUsersWithPushTokens() {
    return prisma.user.findMany({
      where: {
        status: USER_STATUS.ACTIVE,
        pushToken: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        pushToken: true,
        role: true,
      },
    });
  },

  async create(
    hashedPassword: string,
    name: string,
    isDepartmentHead: boolean,
    role: ROLE,
    username: string,
    email?: string,
  ) {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isDepartmentHead,
        role,
        username,
      },
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

  async updatePassword(userId: string, hashedPassword: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });
  },

  async updatePushToken(username: string, pushToken: string) {
    return prisma.user.update({
      where: { username },
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
