import prisma from "@/lib/prisma";

export const createRefreshTokenRecord = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

export const getRefreshTokenByToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deleteRefreshTokenByToken = async (token: string) => {
  try {
    return await prisma.refreshToken.delete({ where: { token } });
  } catch {
    return null;
  }
};

export const deleteRefreshTokensByUserId = async (userId: string) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};
