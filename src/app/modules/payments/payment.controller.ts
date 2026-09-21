import { Request, Response } from 'express';
import { BkashServices } from './bkash.service';
import { SslServices } from './ssl.service';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middlewares/auth';
import sendResponse from '../../utils/sendResponse';

const prisma = new PrismaClient();

// --- bKash Controllers ---
const getParcelPaymentForUser = async (parcelId: string, userId: string, role: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId, deletedAt: null },
    include: { payment: true },
  });

  if (!parcel || (role === 'CUSTOMER' && parcel.senderId !== userId)) {
    throw new Error('Parcel not found!');
  }

  if (!parcel.payment) {
    throw new Error('Payment has not been created for this parcel.');
  }

  return parcel;
};

const initiateBkashPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId } = req.body;
    const parcel = await getParcelPaymentForUser(parcelId, req.user?.id!, String(req.user?.role));
    const callbackUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/bkash/callback?parcelId=${parcelId}`;

    const result = await BkashServices.createBkashPayment(parcelId, parcel.payment!.amount, callbackUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    sendResponse(res, { success: false, statusCode: 400, message });
  }
};

const bkashCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as any;
    const paymentID = Array.isArray(query.paymentID) ? query.paymentID[0] : query.paymentID;
    const status = Array.isArray(query.status) ? query.status[0] : query.status;
    const parcelId = Array.isArray(query.parcelId) ? query.parcelId[0] : query.parcelId;

    if (status === 'success' || status === 'completed') {
      await BkashServices.executeBkashPayment(paymentID as string, parcelId as string);
      res.redirect('http://localhost:3000/payment/success'); 
    } else {
      res.redirect('http://localhost:3000/payment/failed'); 
    }
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};


// --- SSLCommerz Controllers ---
const initiateSslPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId } = req.body;
    const userId = req.user?.id;
    const parcel = await getParcelPaymentForUser(parcelId, userId!, String(req.user?.role));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found!');

    const result = await SslServices.initSslPayment(parcelId, parcel.payment!.amount, {
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const sslSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as any;
    const parcelId = Array.isArray(query.parcelId) ? query.parcelId[0] : query.parcelId;
    const tran_id = Array.isArray(query.tran_id) ? query.tran_id[0] : query.tran_id;
    const val_id = Array.isArray(query.val_id) ? query.val_id[0] : query.val_id;

    const payment = await prisma.payment.findUnique({ where: { parcelId: parcelId as string } });
    if (!payment || payment.transactionId !== tran_id) {
      throw new Error('Payment transaction could not be verified.');
    }

    const validation = await SslServices.validateSslPayment(val_id as string);
    if (validation?.status !== 'VALID' && validation?.status !== 'VALIDATED') {
      throw new Error('SSLCommerz payment validation failed.');
    }

    await prisma.payment.update({
      where: { parcelId: parcelId as string },
      data: { status: PaymentStatus.SUCCESS, transactionId: tran_id as string },
    });

    res.redirect('http://localhost:3000/payment/success');
  } 
  catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

const sslFail = async (req: Request, res: Response): Promise<void> => {
  const query = req.query as any;
  const parcelId = Array.isArray(query.parcelId) ? query.parcelId[0] : query.parcelId;

  await prisma.payment.update({
    where: { parcelId: parcelId as string },
    data: { status: PaymentStatus.FAILED },
  });
  res.redirect('http://localhost:3000/payment/failed');
};

const sslCancel = async (req: Request, res: Response): Promise<void> => {
  const query = req.query as any;
  const parcelId = Array.isArray(query.parcelId) ? query.parcelId[0] : query.parcelId;

  await prisma.payment.update({
    where: { parcelId: parcelId as string },
    data: { status: PaymentStatus.CANCELLED },
  });
  res.redirect('http://localhost:3000/payment/cancel');
};


const getPaymentStatusByParcelId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Ekhane parcelId string kina ba array kina ta safely handle kora holo
    const parcelId = Array.isArray(req.params.parcelId) ? req.params.parcelId[0] : req.params.parcelId;
    
    const parcel = await getParcelPaymentForUser(
      parcelId as string,
      req.user?.id!,
      String(req.user?.role)
    );
    const payment = parcel.payment;
    
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Payment status fetched successfully',
      data: payment || { status: 'UNPAID' },
    });
  } catch (error: any) {
    sendResponse(res, { success: false, statusCode: 400, message: error.message });
  }
};

export const PaymentControllers = {
  initiateBkashPayment,
  bkashCallback,
  initiateSslPayment,
  sslSuccess,
  sslFail,
  sslCancel,
  getPaymentStatusByParcelId,
};