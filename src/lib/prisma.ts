import { PrismaClient } from "@/generated/prisma";


declare global {
    var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.STAGE !== "prod") {
    global.prisma = prisma;
}

export default prisma;