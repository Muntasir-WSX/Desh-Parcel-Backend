import { PrismaClient, ParcelStatus } from '@prisma/client';

const prisma = new PrismaClient();

const AT_HUB_STATUS = 'AT_HUB' as ParcelStatus;
const TRANSFER_TO_HUB_STATUS = 'TRANSFER_TO_HUB' as ParcelStatus;


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


  const nextStatuses: Record<string, ParcelStatus[]> = {
    ASSIGNED: [ParcelStatus.PICKED_UP, ParcelStatus.CANCELLED],
    PICKED_UP: [AT_HUB_STATUS, ParcelStatus.CANCELLED],
    AT_HUB: [TRANSFER_TO_HUB_STATUS, ParcelStatus.OUT_FOR_DELIVERY],
    TRANSFER_TO_HUB: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
    IN_TRANSIT: [ParcelStatus.OUT_FOR_DELIVERY, AT_HUB_STATUS],
    OUT_FOR_DELIVERY: [ParcelStatus.CANCELLED],
  };

  if (status === ParcelStatus.DELIVERED) {
    throw new Error('Use the delivery OTP endpoint to complete delivery.');
  }

  if (!nextStatuses[parcel.status]?.includes(status)) {
    throw new Error(`Parcel cannot move from ${parcel.status} to ${status}.`);
  }


  const result = await prisma.$transaction(async (tx) => {
    const deliveryOtp = status === ParcelStatus.OUT_FOR_DELIVERY
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : undefined;

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { status, deliveryOtp },
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
  amount = Number(amount);

  if (!Number.isFinite(amount) || !bkashNo) {
    throw new Error('A valid amount and bKash number are required.');
  }

  if (amount < 100) {
    throw new Error('Minimum cashout amount is 100 BDT!');
  }

  const profile = await prisma.riderProfile.findUnique({ where: { userId: riderId } });
  if (!profile || profile.totalBalance < amount) {
    throw new Error('Insufficient balance in your wallet!');
  }

  const pendingRequest = await prisma.withdrawalRequest.findFirst({
    where: { riderId, status: 'PENDING' },
  });

  if (pendingRequest) {
    throw new Error('You already have a pending withdrawal request.');
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

const getRiderEarningsReportFromDB = async (riderId: string) => {
  const now = new Date();


  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());


  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);


  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);


  const dailyDelivered = await prisma.parcel.count({
    where: { riderId, status: 'DELIVERED', updatedAt: { gte: startOfDay } },
  });

  const weeklyDelivered = await prisma.parcel.count({
    where: { riderId, status: 'DELIVERED', updatedAt: { gte: startOfWeek } },
  });

  const monthlyDelivered = await prisma.parcel.count({
    where: { riderId, status: 'DELIVERED', updatedAt: { gte: startOfMonth } },
  });


  const commissionRate = 20;

  return {
    daily: {
      deliveredCount: dailyDelivered,
      income: dailyDelivered * commissionRate,
    },
    weekly: {
      deliveredCount: weeklyDelivered,
      income: weeklyDelivered * commissionRate,
    },
    monthly: {
      deliveredCount: monthlyDelivered,
      income: monthlyDelivered * commissionRate,
    },
  };
};

export const RiderServices = {
  getRiderAssignedParcelsFromDB,
  getParcelByIdForRiderFromDB,
  updateParcelStatusByRiderFromDB,
  getRiderDashboardStatsFromDB,
  getRiderProfileAndEarningsFromDB,
  requestCashoutByRiderFromDB,
  getRiderEarningsReportFromDB,


};


// will add if riders own profile+his daily income+his daily parcels+his daily delivered parcels+his daily pending parcels+his daily cancelled parcels+his daily in transit parcels+his daily out for delivery parcels+his daily assigned parcels