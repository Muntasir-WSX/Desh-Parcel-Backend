import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogInput {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (input: AuditLogInput) => {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      details: input.details,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
};