import { PrismaClient, ParcelStatus } from '@prisma/client';
import { cloudinaryUpload } from '../../config/cloudinary';

const prisma = new PrismaClient();

const createParcelIntoDB = async (userId: string, payload: any, file?: Express.Multer.File) => {
  let parcelImage = null;

 
  if (file) {
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryUpload.uploader.upload_stream(
        { folder: 'desh-parcel/parcels' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
    parcelImage = uploadResult.secure_url;
  }

  const trackingId = `CR-${Math.floor(100000 + Math.random() * 900000)}`;

  const parcel = await prisma.parcel.create({
    data: {
      trackingId,
      senderId: userId,
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      pickupAddress: payload.pickupAddress,
      deliveryAddress: payload.deliveryAddress,
      weight: parseFloat(payload.weight),
      category: payload.category,
      parcelImage,
      status: ParcelStatus.PENDING,
    },
  });

  await prisma.trackingLog.create({
    data: {
      parcelId: parcel.id,
      status: 'PENDING',
      note: 'Parcel booked successfully',
    },
  });

  return parcel;
};

const getAllParcelsFromDB = async (query: any, userId: string, role: string) => {
  const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const andConditions: any[] = [{ deletedAt: null }];

  if (role === 'CUSTOMER') {
    andConditions.push({ senderId: userId });
  }

  if (status) {
    andConditions.push({ status });
  }

  if (search) {
    andConditions.push({
      OR: [
        { trackingId: { contains: search, mode: 'insensitive' } },
        { receiverName: { contains: search, mode: 'insensitive' } },
        { receiverPhone: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const parcels = await prisma.parcel.findMany({
    where: { AND: andConditions },
    skip: Number(skip),
    take: Number(limit),
    orderBy: { [sortBy]: sortOrder },
    include: { sender: { select: { name: true, email: true, phone: true } }, rider: { select: { name: true, phone: true } } },
  });

  const total = await prisma.parcel.count({ where: { AND: andConditions } });

  return {
    meta: { page: Number(page), limit: Number(limit), total },
    data: parcels,
  };
};

const getParcelByIdFromDB = async (id: string, userId: string, role: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id, deletedAt: null },
    include: { sender: true, rider: true, trackingLogs: true, payment: true },
  });

  if (!parcel || (role === 'CUSTOMER' && parcel.senderId !== userId)) {
    throw new Error('Parcel not found!');
  }
  return parcel;
};

const updateParcelInDB = async (
  id: string,
  userId: string,
  role: string,
  payload: any,
  file?: Express.Multer.File
) => {
  const parcel = await prisma.parcel.findUnique({ where: { id, deletedAt: null } });
  if (!parcel || (role === 'CUSTOMER' && parcel.senderId !== userId)) {
    throw new Error('Parcel not found!');
  }

  if (parcel.status !== ParcelStatus.PENDING) {
    throw new Error('Can not update parcel once it is processed or picked up!');
  }

  let parcelImage = parcel.parcelImage;

  // যদি আপডেট করার সময় নতুন ছবি দেওয়া হয়
  if (file) {
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryUpload.uploader.upload_stream(
        { folder: 'desh-parcel/parcels' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
    parcelImage = uploadResult.secure_url;
  }

  const updatedParcel = await prisma.parcel.update({
    where: { id },
    data: {
      ...payload,
      weight: payload.weight ? parseFloat(payload.weight) : undefined,
      parcelImage,
    },
  });

  return updatedParcel;
};

const DeleteParcelFromDB = async (id: string, userId: string, role: string) => {
  const parcel = await prisma.parcel.findUnique({ where: { id, deletedAt: null } });
  if (!parcel || (role === 'CUSTOMER' && parcel.senderId !== userId)) {
    throw new Error('Parcel not found!');
  }

  const deletedParcel = await prisma.parcel.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deletedParcel;
};

export const ParcelServices = {
  createParcelIntoDB,
  getAllParcelsFromDB,
  getParcelByIdFromDB,
  updateParcelInDB,
  DeleteParcelFromDB,
};