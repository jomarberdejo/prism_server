import prisma from "@/lib/prisma";

export const sessionRepository = {
  async create(userId: string, token: string, expiresAt: Date) {
    return prisma.session.create({
      data: { userId, token, expiresAt },
    });
  },

  async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async deleteByToken(token: string) {
    try {
      return await prisma.session.delete({ where: { token } });
    } catch {
      return null;
    }
  },

  async deleteByUserId(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  },
};
