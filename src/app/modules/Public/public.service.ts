import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllReviewsFromDB = async () => {
  return await prisma.review.findMany({
    include: {
      user: { select: { name: true, profileImage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PublicServices = {
  getAllReviewsFromDB,
};