import { ROLE } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (
  email: string,
  hashedPassword: string,
  name: string
) => {
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: userSelect,
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

export const updateUserRole = async (id: string, role: ROLE) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
};

export const deleteUserById = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};
