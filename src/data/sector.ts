import prisma from "@/lib/prisma";

const sectorSelect = {
  id: true,
  name: true,
  description: true,
  _count: {
    select: {
      PPA: true,
    },
  },
} as const;

export const sectorRepository = {
  async findAll() {
    return prisma.sector.findMany({
      select: sectorSelect,
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.sector.findUnique({
      where: { id },
      select: {
        ...sectorSelect,

        PPA: {
          select: {
            id: true,
            task: true,
            description: true,
            startDate: true,
            dueDate: true,
          },
        },
      },
    });
  },

  async findByName(name: string) {
    return prisma.sector.findFirst({
      where: { name },
    });
  },

  async create(name: string, description: string) {
    return prisma.sector.create({
      data: { name, description },
      select: sectorSelect,
    });
  },

  async update(id: string, name: string, description: string) {
    return prisma.sector.update({
      where: { id },
      data: { name, description },
      select: sectorSelect,
    });
  },

  async delete(id: string) {
    return prisma.sector.delete({
      where: { id },
    });
  },

  async getSectorWithStats(id: string) {
    return prisma.sector.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            PPA: true,
          },
        },
      },
    });
  },
};
