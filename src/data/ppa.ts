import prisma from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/utils/error";
import { PPA_STATUS, type Prisma } from "@prisma/client";

const ppaSelect: Prisma.PPASelect = {
  id: true,
  task: true,
  description: true,
  address: true,
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
  archivedAt: true,
  userId: true,
  status: true,
  remarks: true,
  actualOutput: true,
  delayedReason: true,
  budgetAllocation: true,
  approvedBudget: true,
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
      where: {
        archivedAt: null,
      },
    });
  },

  async findAllArchived() {
    return prisma.pPA.findMany({
      select: ppaSelect,
      orderBy: { startDate: "asc" },
      where: {
        archivedAt: {
          not: null,
        },
      },
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
    venue?: string;
    startDate: Date;
    dueDate: Date;
    startTime: Date;
    dueTime: Date;
    sectorId: string;
    approvedBudget: string;
    budgetAllocation: string;
    implementingUnitId: string;
    userId: string;
  }) {
    return prisma.pPA.create({
      data,
      select: ppaSelect,
    });
  },

  async update(ppaId: string, data: Prisma.PPAUpdateInput, userId?: string) {
    const ppa = await prisma.pPA.findFirst({
      where: {
        id: ppaId,
        userId,
      },
      select: { id: true },
    });

    console.log("USERID: ", userId);
    console.log("PPAUSERID: ", ppa);

    if (!ppa) {
      throw new ForbiddenError(
        "You are not authorized to perform this action."
      );
    }

    return prisma.pPA.update({
      where: {
        id: ppaId,
      },
      data,
      select: ppaSelect,
    });
  },

  async delete(userId: string, ppaId: string) {
    const ppa = await prisma.pPA.findFirst({
      where: {
        id: ppaId,
        userId,
      },
      select: { id: true },
    });

    if (!ppa) {
      throw new ForbiddenError(
        "You are not authorized to perform this action."
      );
    }

    return prisma.pPA.update({
      where: { id: ppaId },
      data: { archivedAt: new Date()},
      select: ppaSelect,
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
    venue?: string
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
        {
          venue: venue,
        },
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
