import { envConfig } from "@/env";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== envConfig.NODE_ENV) {
  global.prisma = prisma;
}

export default prisma;
