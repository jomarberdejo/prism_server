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
  sector: true,
  implementingUnit: true,
  sectorId: true,
  hourBeforeNotifiedAt: true,
  dayBeforeNotifiedAt: true,
  archivedAt: true,
  userId: true,
  status: true,
  remarks: true,
  actualOutput: true,
  delayedReason: true,
  budgetAllocation: true,
  approvedBudget: true,
  attendees: {
    select: {
      id: true,
      name: true,
    },
  },
  user: {
    select: {
      pushToken: true,
    }
  }
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

  async findAllWithoutDayBeforeNotification() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.pPA.findMany({
      where: {
        dayBeforeNotifiedAt: null,
        archivedAt: null,
        startDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      select: ppaSelect,
      orderBy: { startDate: "asc" },
    });
  },

  async findTodayPPAsWithoutHourNotification() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return prisma.pPA.findMany({
      where: {
        hourBeforeNotifiedAt: null,
        archivedAt: null,
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: ppaSelect,
      orderBy: { startDate: "asc" },
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
    venue?: string;
    expectedOutput: string;
    startDate: Date;
    dueDate: Date;
    sectorId: string;
    budgetAllocation?: string;
    approvedBudget?: string;
    implementingUnitId: string;
    userId: string;
    attendees?: string[];
  }) {
    const ppa = await prisma.pPA.create({
      data: {
        task: data.task,
        description: data.description,
        address: data.address,
        venue: data.venue,
        expectedOutput: data.expectedOutput,
        startDate: data.startDate,
        dueDate: data.dueDate,
        sectorId: data.sectorId,
        budgetAllocation: data.budgetAllocation,
        approvedBudget: data.approvedBudget,
        implementingUnitId: data.implementingUnitId,
        userId: data.userId,
        attendees:
          data.attendees && data.attendees.length > 0
            ? {
                connect: data.attendees.map((id) => ({ id })),
              }
            : undefined,
      },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sector: true,
        implementingUnit: true,
      },
    });

    return ppa;
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
      data: { archivedAt: new Date() },
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
