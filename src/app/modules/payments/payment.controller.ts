import { Request, Response } from 'express';
import { BkashServices } from './bkash.service';
import { SslServices } from './ssl.service';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../middlewares/auth';

const prisma = new PrismaClient();

// --- bKash Controllers ---
const initiateBkashPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId, amount } = req.body;
    const callbackUrl = 'http://localhost:5000/api/v1/payments/bkash/callback';

    const result = await BkashServices.createBkashPayment(parcelId, amount, callbackUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const bkashCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { paymentID, status, parcelId } = req.query as any;

    if (status === 'success' || status === 'completed') {
      await BkashServices.executeBkashPayment(paymentID as string, parcelId as string);
      res.redirect('http://localhost:3000/payment/success'); 
    } else {
      res.redirect('http://localhost:3000/payment/failed'); 
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// --- SSLCommerz Controllers ---
const initiateSslPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { parcelId, amount } = req.body;
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found!');

    const result = await SslServices.initSslPayment(parcelId, amount, {
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sslSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parcelId, tran_id } = req.query as any;

    await prisma.payment.update({
      where: { parcelId: parcelId as string },
      data: { status: PaymentStatus.SUCCESS, transactionId: tran_id as string },
    });

    res.redirect('http://localhost:3000/payment/success');
  } catch (error: any) {
    res.status(400).json({ success: extraError(error) || error.message });
  }
};

const sslFail = async (req: Request, res: Response): Promise<void> => {
  const { parcelId } = req.query as any;
  await prisma.payment.update({
    where: { parcelId: parcelId as string },
    data: { status: PaymentStatus.FAILED },
  });
  res.redirect('http://localhost:3000/payment/failed');
};

const sslCancel = async (req: Request, res: Response): Promise<void> => {
  const { parcelId } = req.query as any;
  await prisma.payment.update({
    where: { parcelId: parcelId as string },
    data: { status: PaymentStatus.CANCELLED },
  });
  res.redirect('http://localhost:3000/payment/cancel');
};


export const PaymentControllers = {
  initiateBkashPayment,
  bkashCallback,
  initiateSslPayment,
  sslSuccess,
  sslFail,
  sslCancel,
};