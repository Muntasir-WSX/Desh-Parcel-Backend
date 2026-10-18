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


const getAllBlogsFromDB = async () => {
  return await prisma.blog.findMany({
    include: { author: { select: { name: true, profileImage: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getBlogByIdFromDB = async (blogId: string) => {
  return await prisma.blog.findUnique({
    where: { id: blogId },
    include: { author: { select: { name: true, profileImage: true } } },
  });
};


export const PublicServices = {
  subscribeNewsletterIntoDB,
  getAllReviewsFromDB,
  getAllBlogsFromDB,
  getBlogByIdFromDB,
};