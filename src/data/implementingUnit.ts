import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const implementingUnitSelect: Prisma.ImplementingUnitSelect = {
  id: true,
  name: true,
  userId: true,
  sectorId: true,
  deptHead: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  sector: {
    select: {
      id: true,
      name: true,
      description: true,
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
      startTime: true,
      dueTime: true,
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

  async findBySectorId(sectorId: string) {
    return prisma.implementingUnit.findMany({
      where: { sectorId },
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

  async create(name: string, userId: string, sectorId: string) {
    return prisma.implementingUnit.create({
      data: { name, userId, sectorId },
      select: implementingUnitSelect,
    });
  },

  async update(id: string, name: string, userId: string, sectorId: string) {
    console.log("PRISMA UPDATE: ", id)
    return prisma.implementingUnit.update({
      where: { id },
      data: { name, userId, sectorId },
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
