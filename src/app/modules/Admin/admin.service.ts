import { PrismaClient, ParcelStatus, Role, WithdrawalStatus } from '@prisma/client';
import { PROTECTED_ADMIN_EMAIL } from '../../config/admin';
import { sendEmail } from '../../utils/sendEmail';

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

  const updatedParcel = await prisma.$transaction(async (tx) => {
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

  const parcelWithSender = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: { sender: { select: { name: true, email: true } } },
  });

  if (parcelWithSender) {
    try {
      await sendEmail(
        parcelWithSender.sender.email,
        'Your parcel has been approved - DeshParcel',
        `<h3>Hello ${parcelWithSender.sender.name},</h3>
         <p>Your parcel with tracking ID <b>${parcelWithSender.trackingId}</b> has been approved.</p>
         <p>We will assign a rider for pickup soon.</p>`
      );
    } catch (error) {
      console.error('Parcel approval email could not be sent:', error);
    }
  }

  return updatedParcel;
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


const updateParcelHubStatusIntoDB = async (parcelId: string, currentHub: string, note: string) => {
  const parcel = await prisma.parcel.findUnique({ where: { id: parcelId, deletedAt: null } });
  if (!parcel) throw new Error('Parcel not found!');

  const result = await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: 'IN_TRANSIT' },
    });

    await tx.trackingLog.create({
      data: {
        parcelId,
        status: 'IN_TRANSIT',
        note: `Parcel arrived at ${currentHub} Hub. ${note}`,
      },
    });

    return updatedParcel;
  });

  return result;
};

const getAllWithdrawalRequestsFromDB = async () => {
  return await prisma.withdrawalRequest.findMany({
    include: {
      rider: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateWithdrawalStatusByAdminFromDB = async (
  requestId: string,
  status: WithdrawalStatus
) => {
  const request = await prisma.withdrawalRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error('Withdrawal request not found!');
  if (request.status !== WithdrawalStatus.PENDING) {
    throw new Error('This withdrawal request has already been processed.');
  }

  if (status !== WithdrawalStatus.APPROVED && status !== WithdrawalStatus.REJECTED) {
    throw new Error('Invalid withdrawal status.');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.withdrawalRequest.update({
      where: { id: requestId },
      data: { status },
    });

    if (status === WithdrawalStatus.REJECTED) {
      await tx.riderProfile.update({
        where: { userId: request.riderId },
        data: {
          totalBalance: { increment: request.amount },
          withdrawn: { decrement: request.amount },
        },
      });
    }

    return updatedRequest;
  });
};

const getAuditLogsFromDB = async (query: {
  page?: string | number;
  limit?: string | number;
  action?: string;
  resource?: string;
  actorId?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const where = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.resource ? { resource: query.resource } : {}),
    ...(query.actorId ? { actorId: query.actorId } : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: logs };
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
  updateParcelHubStatusIntoDB,
  getAllWithdrawalRequestsFromDB,
  updateWithdrawalStatusByAdminFromDB,
  getAuditLogsFromDB,
};


// delete parcel will add