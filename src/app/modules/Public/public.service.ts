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


const subscribeNewsletterIntoDB = async (email: string) => {
  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (existing) {
    throw new Error('This email is already subscribed to our newsletter!');
  }

  return await prisma.newsletter.create({
    data: { email },
  });
};


export const PublicServices = {
  subscribeNewsletterIntoDB,
  getAllReviewsFromDB,
};