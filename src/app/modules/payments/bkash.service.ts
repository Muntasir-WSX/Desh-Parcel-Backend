import axios from 'axios';
import { PrismaClient, PaymentStatus, PaymentGateway } from '@prisma/client';

const prisma = new PrismaClient();


const getBkashToken = async () => {
  const response = await axios.post(
    `${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
      auth: {
        username: process.env.BKASH_APP_KEY!,
        password: process.env.BKASH_APP_SECRET!,
      },
    }
  );
  return response.data.id_token;
};


const createBkashPayment = async (parcelId: string, amount: number, callbackUrl: string) => {
  const idToken = await getBkashToken();
  const merchantInvoiceNumber = `INV-${Date.now()}`;

  const response = await axios.post(
    `${process.env.BKASH_BASE_URL}/tokenized/checkout/create`,
    {
      mode: '0011',
      payerReference: '1',
      callbackURL: callbackUrl,
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: merchantInvoiceNumber,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: idToken,
        'x-app-key': process.env.BKASH_APP_KEY,
      },
    }
  );

  const bkashResponse = response.data;


  await prisma.payment.upsert({
    where: { parcelId },
    update: {
      amount,
      gateway: PaymentGateway.BKASH,
      status: PaymentStatus.PENDING,
      transactionId: merchantInvoiceNumber,
    },
    create: {
      parcelId,
      amount,
      gateway: PaymentGateway.BKASH,
      status: PaymentStatus.PENDING,
      transactionId: merchantInvoiceNumber,
    },
  });

  return bkashResponse; 
};


const executeBkashPayment = async (paymentID: string, parcelId: string) => {
  const payment = await prisma.payment.findUnique({ where: { parcelId } });
  if (!payment || payment.gateway !== PaymentGateway.BKASH || payment.status !== PaymentStatus.PENDING) {
    throw new Error('The bKash payment is not available for execution.');
  }

  const idToken = await getBkashToken();

  const response = await axios.post(
    `${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: idToken,
        'x-app-key': process.env.BKASH_APP_KEY,
      },
    }
  );

  const result = response.data;

  if (result && result.statusCode === '0000') {
    if (Number(result.amount) !== payment.amount) {
      throw new Error('The bKash payment amount could not be verified.');
    }
  
    await prisma.payment.update({
      where: { parcelId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId: result.trxID,
      },
    });

    return { success: true, message: 'Payment successful', trxID: result.trxID };
  } else {
    await prisma.payment.update({
      where: { parcelId },
      data: { status: PaymentStatus.FAILED },
    });
    throw new Error(result.statusMessage || 'Payment execution failed');
  }
};

export const BkashServices = {
  createBkashPayment,
  executeBkashPayment,
};