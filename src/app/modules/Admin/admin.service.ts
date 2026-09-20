import { PrismaClient, ParcelStatus, Role } from '@prisma/client';
import { PROTECTED_ADMIN_EMAIL } from '../../config/admin';

const prisma = new PrismaClient();

const APPROVED_PARCEL_STATUS = 'APPROVED' as ParcelStatus;


const updateUserRoleIntoDB = async (userId: string, role: Role, actorRole: string) => {
  if (actorRole !== Role.ADMIN) {
    throw new Error('Only the admin can change user roles.');
  }

  if (role === Role.ADMIN) {
    throw new Error('Another admin account cannot be created.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found!');

  if (user.email.toLowerCase() === PROTECTED_ADMIN_EMAIL) {
    throw new Error('The protected admin account cannot be changed.');
  }

  if (role === Role.MODERATOR && user.role !== Role.CUSTOMER) {
    throw new Error('Only customer accounts can be promoted to moderator.');
  }

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


  const rider = await prisma.user.findUnique({
    where: { id: riderId, role: Role.RIDER },
    include: { riderProfile: true },
  });
  if (!rider || !rider.riderProfile?.isApproved || !rider.riderProfile.isAvailable) {
    throw new Error('Rider is not approved or available!');
  }

  if (parcel.status !== APPROVED_PARCEL_STATUS) {
    throw new Error('Only approved parcels can be assigned to a rider!');
  }

 
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

const approveParcelIntoDB = async (parcelId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId, deletedAt: null },
  });

  if (!parcel) throw new Error('Parcel not found!');
  if (parcel.status !== ParcelStatus.PENDING) {
    throw new Error('Only pending parcels can be approved!');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: APPROVED_PARCEL_STATUS },
    });

    await tx.trackingLog.create({
      data: {
        parcelId,
        status: APPROVED_PARCEL_STATUS,
        note: 'Parcel approved by admin or moderator',
      },
    });

    return updatedParcel;
  });
};

const approveRiderIntoDB = async (riderId: string) => {
  const rider = await prisma.user.findUnique({
    where: { id: riderId, role: Role.RIDER },
    include: { riderProfile: true },
  });

  if (!rider || !rider.riderProfile) throw new Error('Rider not found!');

  return await prisma.riderProfile.update({
    where: { userId: riderId },
    data: { isApproved: true },
  });
};

const banUserIntoDB = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found!');

  if (user.role === Role.ADMIN || user.email.toLowerCase() === PROTECTED_ADMIN_EMAIL) {
    throw new Error('The protected admin account cannot be banned.');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true },
    select: { id: true, name: true, email: true, role: true, isBanned: true },
  });
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
  approveParcelIntoDB,
  approveRiderIntoDB,
  banUserIntoDB,
  assignParcelToRiderIntoDB,
  getAdminDashboardStatsFromDB,
  getAllUsersFromDB,
  getAllParcelsForAdminFromDB,
  deleteParcelByAdminIntoDB,
};


// delete parcel will add