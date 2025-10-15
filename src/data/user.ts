import { ROLE } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
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

  async create(email: string, hashedPassword: string, name: string) {
    return prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: userSelect,
    });
  },

  async findAll() {
    return prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async findByRole(role: ROLE) {
    return prisma.user.findMany({
      where: { role },
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


  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};