import prisma from "@/lib/prisma";

export const passwordResetRepository = {
  async upsert(data: { userId: string; otpHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.upsert({
      where: { userId: data.userId },
      update: {
        otpHash: data.otpHash,
        expiresAt: data.expiresAt,
        resetToken: null,
        used: false,
      },
      create: {
        userId: data.userId,
        otpHash: data.otpHash,
        expiresAt: data.expiresAt,
        used: false,
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.passwordResetToken.findUnique({
      where: { userId },
    });
  },

  async setResetToken(id: string, resetToken: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { resetToken, used: true },
    });
  },

  async findByResetToken(resetToken: string) {
    return prisma.passwordResetToken.findUnique({
      where: { resetToken },
    });
  },

  async deleteById(id: string) {
    try {
      return await prisma.passwordResetToken.delete({ where: { id } });
    } catch {
      return null;
    }
  },

  async deleteByUserId(userId: string) {
    try {
      return await prisma.passwordResetToken.delete({ where: { userId } });
    } catch {
      return null;
    }
  },
};