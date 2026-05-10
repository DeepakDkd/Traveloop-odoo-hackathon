// import { PrismaClient } from "@prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// const prismaClientSingleton = () => {
//     return new PrismaClient().$extends(withAccelerate());
// };
// const globalForPrisma = global as unknown as {
//     prisma: ReturnType<typeof prismaClientSingleton> | undefined;
// };

// export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
