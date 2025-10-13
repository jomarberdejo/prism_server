

import prisma from "@/lib/prisma";

export const createSessionRecord = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  return prisma.session.create({
    data: { userId, token, expiresAt },
  });
};

export const getSessionByToken = async (token: string) => {
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deleteSessionByToken = async (token: string) => {
  return prisma.session.delete({ where: { token } }).catch(() => null);
};

export const deleteSessionsByUserId = async (userId: string) => {
  return prisma.session.deleteMany({ where: { userId } });
};

