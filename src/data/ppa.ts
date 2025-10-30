import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const ppaSelect: Prisma.PPASelect = {
  id: true,
  task: true,
  description: true,
  address: true,
  location: true,
  venue: true,
  expectedOutput: true,
  startDate: true,
  dueDate: true,
  startTime: true,
  dueTime: true,
  sector: true,
  implementingUnit: true,
  sectorId: true,
  lastNotifiedAt: true,
} as const;

export const ppaRepository = {
  async findById(id: string) {
    return prisma.pPA.findUnique({
      where: { id },
      select: ppaSelect,
    });
  },

  async findAll() {
    return prisma.pPA.findMany({
      select: ppaSelect,
      orderBy: { startDate: "asc" },
    });
  },

  async findAllWithNoNotified() {
    return prisma.pPA.findMany({
      where: {
        lastNotifiedAt: null,
      },
      select: ppaSelect,
      orderBy: { startDate: "desc" },
    });
  },

  async findBySector(sectorId: string) {
    return prisma.pPA.findMany({
      where: { sectorId },
      select: ppaSelect,
    });
  },

  async findByImplementingUnit(implementingUnitId: string) {
    return prisma.pPA.findMany({
      where: { implementingUnitId },
      select: ppaSelect,
    });
  },

  async create(data: {
    task: string;
    description: string;
    address: string;
    expectedOutput: string;
    location?: string;
    venue?: string;
    startDate: Date;
    dueDate: Date;
    startTime: Date;
    dueTime: Date;
    sectorId: string;
    implementingUnitId: string;
  }) {
    return prisma.pPA.create({
      data,
      select: ppaSelect,
    });
  },

  async update(id: string, data: Prisma.PPAUpdateInput) {
    return prisma.pPA.update({
      where: { id },
      data,
      select: ppaSelect,
    });
  },

  async delete(id: string) {
    return prisma.pPA.delete({
      where: { id },
    });
  },

  // async findUpcomingPPAs() {
  //   const now = new Date();
  //   const tomorrow = new Date(now);
  //   tomorrow.setDate(now.getDate() + 1);

  //   return prisma.pPA.findMany({
  //     where: {
  //       startDate: {
  //         gte: now,
  //         lte: tomorrow,
  //       },
  //     },
  //     select: ppaSelect,
  //   });
  // },

  // async findConflictingLocations(

  //   startDate: Date,
  //   dueDate: Date,
  //   excludePPAId?: string
  // ) {
  //   return prisma.pPA.findMany({
  //     where: {
  //       AND: [
  //         {
  //           startDate: { lte: dueDate },
  //           dueDate: { gte: startDate },
  //         },
  //         ...(excludePPAId ? [{ id: { not: excludePPAId } }] : []),
  //       ],
  //     },
  //     select: {
  //       id: true,
  //       task: true,
  //       startDate: true,
  //       dueDate: true,
  //       location: true,
  //       venue: true,
  //     },
  //   });
  // },

  async findOverlappingPPAs(
    startDate: Date,
    dueDate: Date,
    excludePPAId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereClause: any = {
      AND: [
        { startDate: { lte: end } },
        { dueDate: { gte: start } },
        { dueDate: { gt: today } },
      ],
    };

    if (excludePPAId) {
      whereClause.id = { not: excludePPAId };
    }

    return prisma.pPA.findMany({
      where: whereClause,
      include: {
        sector: { select: { id: true, name: true } },
        implementingUnit: { select: { id: true, name: true } },
      },
      orderBy: { startDate: "asc" },
    });
  },
};
