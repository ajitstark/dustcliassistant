// Prisma generates `PrismaClient` at install/generate time. Some environments
// disable postinstall scripts; keep this module compiling and rely on
// `pnpm approve-builds` + `pnpm prisma:generate` for full typing.
type PrismaClientLike = any;

let prisma: PrismaClientLike | undefined;

export function getPrisma() {
  const { PrismaClient } = require("@prisma/client");
  prisma ??= new PrismaClient();
  return prisma;
}
