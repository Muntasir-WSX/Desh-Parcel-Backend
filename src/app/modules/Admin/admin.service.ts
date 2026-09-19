import { PrismaClient, ParcelStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();


const updateUserRoleIntoDB = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found!');

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return updatedUser;
};


const assignParcelToRiderIntoDB = async (parcelId: string, riderId: string) => {

  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId, deletedAt: null } });
  if (!parcel) throw new Error('Parcel not found!');


  const rider = await prisma.user.findUnique({ where: { id: riderId, role: Role.RIDER } });
  if (!rider) throw new Error('Valid rider not found!');

 
  const result = await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        riderId,
        status: ParcelStatus.ASSIGNED,
      },
    });

    await tx.trackingLog.create({
      data: {
        parcelId,
        status: 'ASSIGNED',
        note: `Parcel assigned to rider ${rider.name}`,
      },
    });

    return updatedParcel;
  });

  return result;
};


const getAdminDashboardStatsFromDB = async () => {
  const totalUsers = await prisma.user.count();
  const totalParcels = await prisma.parcel.count({ where: { deletedAt: null } });
  const totalRiders = await prisma.user.count({ where: { role: Role.RIDER } });
  
 
  const successfulPayments = await prisma.payment.aggregate({
    where: { status: 'SUCCESS' },
    _sum: { amount: true },
  });

  const parcelStatusCounts = await prisma.parcel.groupBy({
    by: ['status'],
    _count: { status: true },
    where: { deletedAt: null },
  });

  return {
    totalUsers,
    totalRiders,
    totalParcels,
    totalRevenue: successfulPayments._sum.amount || 0,
    parcelStatusCounts,
  };
};

const getAllUsersFromDB = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });
  const total = await prisma.user.count();
  return {
    meta: { page, limit, total },
    result: users,
  };
};

const getAllParcelsForAdminFromDB = async () => {
  return await prisma.parcel.findMany({
    where: { deletedAt: null },
    include: { sender: true, rider: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
};

const deleteParcelByAdminIntoDB = async (parcelId: string, reason?: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId, deletedAt: null },
  });

  if (!parcel) {
    throw new Error('Parcel not found or already deleted!');
  }

  
  const result = await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        deletedAt: new Date(),
        status: 'CANCELLED',
      },
    });

    await tx.trackingLog.create({
      data: {
        parcelId,
        status: 'CANCELLED',
        note: reason 
          ? `Parcel rejected and deleted by admin. Reason: ${reason}` 
          : 'Parcel rejected by admin due to description/image mismatch.',
      },
    });

    return updatedParcel;
  });

  return result;
};



export const AdminServices = {
  updateUserRoleIntoDB,
  assignParcelToRiderIntoDB,
  getAdminDashboardStatsFromDB,
  getAllUsersFromDB,
  getAllParcelsForAdminFromDB,
  deleteParcelByAdminIntoDB,
};


// delete parcel will add