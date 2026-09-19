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

export const RiderServices = {
  getRiderAssignedParcelsFromDB,
  getParcelByIdForRiderFromDB,
  updateParcelStatusByRiderFromDB,
};