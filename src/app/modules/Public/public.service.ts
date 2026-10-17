const getAllReviewsFromDB = async () => {
  return await prisma.review.findMany({
    include: {
      user: { select: { name: true, profileImage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};