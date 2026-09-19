import { PrismaClient, ParcelStatus } from '@prisma/client';

const prisma = new PrismaClient();


const getRiderAssignedParcelsFromDB = async (riderId: string) => {
  const parcels = await prisma.parcel.findMany({
    where: {
      riderId,
      deletedAt: null,
    },
    include: {
      sender: { select: { name: true, phone: true, email: true } },
      payment: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return parcels;
};

const getParcelByIdForRiderFromDB = async (riderId: string, parcelId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: {
      id: parcelId,
      riderId,
      deletedAt: null,
    },
    include: {
      sender: { select: { name: true, phone: true, email: true } },
      trackingLogs: true,
      payment: true,
    },
  });

  if (!parcel) throw new Error('Assigned parcel not found or you are not authorized!');
  return parcel;
};


const updateParcelStatusByRiderFromDB = async (
  riderId: string,
  parcelId: string,
  status: ParcelStatus,
  note: string
) => {
 
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId, riderId, deletedAt: null },
  });

  if (!parcel) throw new Error('Parcel not found or not assigned to you!');

 
  const allowedStatuses: ParcelStatus[] = [
    ParcelStatus.ASSIGNED,
    ParcelStatus.PICKED_UP,
    ParcelStatus.IN_TRANSIT,
    ParcelStatus.OUT_FOR_DELIVERY,
    ParcelStatus.DELIVERED,
    ParcelStatus.CANCELLED,
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status update for rider!');
  }


  const result = await prisma.$transaction(async (tx) => {
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { status },
    });

    await tx.trackingLog.create({
      data: {
        parcelId,
        status,
        note: note || `Parcel status updated to ${status} by rider`,
      },
    });

    return updatedParcel;
  });

  return result;
};

const getRiderDashboardStatsFromDB = async (riderId: string) => {
  const totalAssigned = await prisma.parcel.count({ where: { riderId, deletedAt: null } });
  const totalDelivered = await prisma.parcel.count({ where: { riderId, status: 'DELIVERED', deletedAt: null } });
  const totalPendingPickup = await prisma.parcel.count({ where: { riderId, status: 'ASSIGNED', deletedAt: null } });

  return {
    totalAssigned,
    totalDelivered,
    totalPendingPickup,
  };
};


const getRiderProfileAndEarningsFromDB = async (riderId: string) => {
  const rider = await prisma.user.findUnique({
    where: { id: riderId },
    include: { riderProfile: true },
  });


  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const dailyDeliveredCount = await prisma.parcel.count({
    where: {
      riderId,
      status: 'DELIVERED',
      updatedAt: { gte: todayStart },
    },
  });

  const dailyCancelledCount = await prisma.parcel.count({
    where: {
      riderId,
      status: 'CANCELLED',
      updatedAt: { gte: todayStart },
    },
  });

  const dailyPendingCount = await prisma.parcel.count({
    where: {
      riderId,
      status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
    },
  });


  
  const deliveryCommission = 20; 
  const dailyIncome = dailyDeliveredCount * deliveryCommission;

  return {
    riderDetails: {
      name: rider?.name,
      email: rider?.email,
      phone: rider?.phone,
      balance: rider?.riderProfile?.totalBalance || 0,
    },
    dailyStats: {
      dailyDelivered: dailyDeliveredCount,
      dailyCancelled: dailyCancelledCount,
      dailyPending: dailyPendingCount,
      dailyIncome,
    },
  };
};


const requestCashoutByRiderFromDB = async (riderId: string, amount: number, bkashNo: string) => {
  if (amount < 100) {
    throw new Error('Minimum cashout amount is 100 BDT!');
  }

  const profile = await prisma.riderProfile.findUnique({ where: { userId: riderId } });
  if (!profile || profile.totalBalance < amount) {
    throw new Error('Insufficient balance in your wallet!');
  }

  const result = await prisma.$transaction(async (tx) => {
    
    await tx.riderProfile.update({
      where: { userId: riderId },
      data: {
        totalBalance: { decrement: amount },
        withdrawn: { increment: amount },
      },
    });

   
    const withdrawal = await tx.withdrawalRequest.create({
      data: {
        riderId,
        amount,
        bkashNo,
        status: 'PENDING',
      },
    });

    return withdrawal;
  });

  return result;
};

export const RiderServices = {
  getRiderAssignedParcelsFromDB,
  getParcelByIdForRiderFromDB,
  updateParcelStatusByRiderFromDB,
  getRiderDashboardStatsFromDB,
  getRiderProfileAndEarningsFromDB,
  requestCashoutByRiderFromDB,
  
  
};


// will add if riders own profile+his daily income+his daily parcels+his daily delivered parcels+his daily pending parcels+his daily cancelled parcels+his daily in transit parcels+his daily out for delivery parcels+his daily assigned parcels