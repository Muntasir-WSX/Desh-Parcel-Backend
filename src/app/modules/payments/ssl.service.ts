import SSLCommerzPayment from 'sslcommerz-lts';
import { PrismaClient, PaymentStatus, PaymentGateway } from '@prisma/client';
import { sendNotificationEmail } from '../../utils/sendEmail';

const prisma = new PrismaClient();

const store_id = process.env.STORE_ID!;
const store_passwd = process.env.STORE_PASSWORD!;
const is_live = process.env.IS_LIVE === 'true';
const apiUrl = process.env.API_URL || 'http://localhost:5000';

const initSslPayment = async (parcelId: string, amount: number, user: { name: string; email: string; phone: string }) => {
  const tran_id = `TRAN_${Date.now()}`;

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: tran_id,
    success_url: `${apiUrl}/api/v1/payments/ssl/success?parcelId=${parcelId}&tran_id=${tran_id}`,
    fail_url: `${apiUrl}/api/v1/payments/ssl/fail?parcelId=${parcelId}`,
    cancel_url: `${apiUrl}/api/v1/payments/ssl/cancel?parcelId=${parcelId}`,
    ipn_url: `${apiUrl}/api/v1/payments/ssl/ipn`,
    shipping_method: 'Courier',
    product_name: 'Parcel Delivery Service',
    product_category: 'Logistics',
    product_profile: 'general',
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: 'Chittagong',
    cus_city: 'Chittagong',
    cus_postcode: '4000',
    cus_country: 'Bangladesh',
    cus_phone: user.phone,
    ship_name: user.name,
    ship_add1: 'Chittagong',
    ship_city: 'Chittagong',
    ship_postcode: '4000',
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);


  const apiResponse: any = await sslcz.init(data);

  if (apiResponse?.GatewayPageURL) {
   
    await prisma.payment.upsert({
      where: { parcelId },
      update: {
        amount,
        gateway: PaymentGateway.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        transactionId: tran_id,
      },
      create: {
        parcelId,
        amount,
        gateway: PaymentGateway.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        transactionId: tran_id,
      },
    });

    return { gatewayPageURL: apiResponse.GatewayPageURL };
  } else {
    throw new Error('Failed to connect with SSLCommerz payment gateway');
  }
};

const validateSslPayment = async (valId: string) => {
  if (!valId) {
    throw new Error('SSLCommerz validation ID is missing.');
  }

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  return await sslcz.validate({ val_id: valId });
};

const updateSslPaymentStatus = async (
  parcelId: string,
  status: PaymentStatus,
  transactionId?: string
) => {
  const payment = await prisma.payment.findUnique({ where: { parcelId } });
  if (!payment) {
    throw new Error('Payment transaction not found.');
  }

  
const updatedPayment = await prisma.payment.update({
  where: { parcelId },
    data: {
      status,
      transactionId: transactionId || payment.transactionId,
    },
  });

  if (status === PaymentStatus.SUCCESS && payment.status !== PaymentStatus.SUCCESS) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { sender: true },
    });
    if (parcel?.sender) {
      void sendNotificationEmail({
        to: parcel.sender.email,
        userName: parcel.sender.name,
        subject: `Payment Successful - ${updatedPayment.transactionId || 'Confirmed'}`,
        title: 'Payment Confirmed',
        message: `Your payment of ৳${payment.amount} has been successfully processed via SSLCommerz. Your parcel is now active for processing.`,
        actionText: 'Track Parcel',
        actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${parcel.trackingId}`,
      }).catch((error) => console.error('SSLCommerz payment email could not be sent:', error));
    }
  }

  return updatedPayment;
};

export const SslServices = {
  initSslPayment,
  validateSslPayment,
  updateSslPaymentStatus,
};