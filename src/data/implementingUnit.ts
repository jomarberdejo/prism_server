import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const implementingUnitSelect: Prisma.ImplementingUnitSelect = {
  id: true,
  name: true,
  userId: true,
  deptHead: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  _count: {
    select: {
      PPA: true,
    },
  },
  PPA: {
    select: {
      id: true,
      task: true,
      description: true,
      address: true,
      startDate: true,
      dueDate: true,
    },
  },
} as const;

export const implementingUnitRepository = {
  async findAll() {
    return prisma.implementingUnit.findMany({
      select: implementingUnitSelect,
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.implementingUnit.findUnique({
      where: { id },
      select: implementingUnitSelect,
    });
  },

 

  async findByUserId(userId: string) {
    return prisma.implementingUnit.findUnique({
      where: { userId },
      select: implementingUnitSelect,
    });
  },

  async findByName(name: string) {
    return prisma.implementingUnit.findFirst({
      where: { name },
    });
  },

  async create(name: string, userId: string) {
    return prisma.implementingUnit.create({
      data: { name, userId },
      select: implementingUnitSelect,
    });
  },

  async update(id: string, name: string, userId: string) {
    console.log("PRISMA UPDATE: ", id);
    return prisma.implementingUnit.update({
      where: { id },
      data: { name, userId },
      select: implementingUnitSelect,
    });
  },

  async delete(id: string) {
    return prisma.implementingUnit.delete({
      where: { id },
    });
  },

  async updateDepartmentHead(id: string, userId: string) {
    return prisma.implementingUnit.update({
      where: { id },
      data: { userId },
      select: implementingUnitSelect,
    });
  },
};
