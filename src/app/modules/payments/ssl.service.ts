import SSLCommerzPayment from 'sslcommerz-lts';
import { PrismaClient, PaymentStatus, PaymentGateway } from '@prisma/client';

const prisma = new PrismaClient();

const store_id = process.env.STORE_ID!;
const store_passwd = process.env.STORE_PASSWORD!;
const is_live = process.env.IS_LIVE === 'true'; 

const initSslPayment = async (parcelId: string, amount: number, user: { name: string; email: string; phone: string }) => {
  const tran_id = `TRAN_${Date.now()}`;

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: tran_id, 
    success_url: `http://localhost:5000/api/v1/payments/ssl/success?parcelId=${parcelId}&tran_id=${tran_id}`,
    fail_url: `http://localhost:5000/api/v1/payments/ssl/fail?parcelId=${parcelId}`,
    cancel_url: `http://localhost:5000/api/v1/payments/ssl/cancel?parcelId=${parcelId}`,
    ipn_url: 'http://localhost:5000/api/v1/payments/ssl/ipn',
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

export const SslServices = {
  initSslPayment,
  validateSslPayment,
};