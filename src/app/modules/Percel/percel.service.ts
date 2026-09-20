import { PrismaClient, ParcelStatus } from '@prisma/client';
import { cloudinaryUpload } from '../../config/cloudinary';
import { calculateParcelDeliveryFee } from '../../utils/calculatePrice';
import { sendEmail } from '../../utils/sendEmail';

const prisma = new PrismaClient();



const createParcelIntoDB = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File
) => {
  const { receiverName, receiverPhone, pickupAddress, deliveryAddress, weight, category } = payload;
  const normalizedWeight = Number(weight);

  if (!Number.isFinite(normalizedWeight) || normalizedWeight <= 0) {
    throw new Error('Parcel weight must be a positive number.');
  }

  const trackingId = 'DP-' + Math.floor(100000 + Math.random() * 900000);
  let parcelImage = payload.parcelImage;

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


  const deliveryFee = calculateParcelDeliveryFee(pickupAddress, deliveryAddress, normalizedWeight);

  const result = await prisma.$transaction(async (tx) => {
    const newParcel = await tx.parcel.create({
      data: {
        trackingId,
        senderId: userId,
        receiverName,
        receiverPhone,
        pickupAddress,
        deliveryAddress,
        weight: normalizedWeight,
        category,
        parcelImage,
        status: 'PENDING', // অ্যাডমিন অ্যাপ্রুভালের পূর্বে পেন্ড থাকবে
      },
    });


    await tx.payment.create({
      data: {
        parcelId: newParcel.id,
        amount: deliveryFee,
        gateway: 'BKASH',
        status: 'PENDING',
      },
    });


    await tx.trackingLog.create({
      data: {
        parcelId: newParcel.id,
        status: 'PENDING',
        note: 'Parcel created successfully and waiting for payment & admin approval.',
      },
    });

    return { ...newParcel, calculatedDeliveryFee: deliveryFee };
  });

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (sender) {
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${result.trackingId}`;
    try {
      await sendEmail(
        sender.email,
        'Your parcel is pending - DeshParcel',
        `<h3>Hello ${sender.name},</h3>
         <p>Your parcel with tracking ID <b>${result.trackingId}</b> has been created.</p>
         <p>It is currently pending admin approval. Delivery fee: <b>${deliveryFee} BDT</b>.</p>
         <p>Track your parcel: <a href="${trackingUrl}">${trackingUrl}</a></p>`
      );
    } catch (error) {
      console.error('Pending parcel email could not be sent:', error);
    }
  }

  return result;
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
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      pickupAddress: payload.pickupAddress,
      deliveryAddress: payload.deliveryAddress,
      category: payload.category,
      weight: payload.weight ? parseFloat(payload.weight) : undefined,
      parcelImage,
    },
  });
  return updatedParcel;
};

const getParcelTrackingByTrackingIdFromDB = async (trackingId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { trackingId, deletedAt: null },
    select: {
      trackingId: true,
      status: true,
      receiverName: true,
      pickupAddress: true,
      deliveryAddress: true,
      createdAt: true,
      updatedAt: true,
      trackingLogs: {
        select: { status: true, note: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!parcel) throw new Error('Tracking ID not found!');
  return parcel;
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


const generateDeliveryOtp = async (parcelId: string) => {
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // ৪ ডিজিটের ওটিপি

  await prisma.parcel.update({
    where: { id: parcelId },
    data: { deliveryOtp: otpCode },
  });


  return otpCode;
};


const verifyAndDeliverParcel = async (riderId: string, parcelId: string, otpInput: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId, riderId, deletedAt: null },
  });

  if (!parcel) throw new Error('Parcel not found or not assigned to you!');
  if (parcel.deliveryOtp !== otpInput) {
    throw new Error('Invalid Delivery OTP! Please check with the receiver.');
  }

  const result = await prisma.$transaction(async (tx) => {

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: { status: 'DELIVERED', deliveryOtp: null },
    });


    const commission = 20;
    await tx.riderProfile.update({
      where: { userId: riderId },
      data: { totalBalance: { increment: commission } },
    });


    await tx.trackingLog.create({
      data: {
        parcelId,
        status: 'DELIVERED',
        note: 'Parcel successfully delivered and verified with OTP.',
      },
    });

    return updatedParcel;
  });

  return result;
};



export const ParcelServices = {
  createParcelIntoDB,
  getAllParcelsFromDB,
  getParcelByIdFromDB,
  getParcelTrackingByTrackingIdFromDB,
  updateParcelInDB,
  DeleteParcelFromDB,
  generateDeliveryOtp,
  verifyAndDeliverParcel,
};