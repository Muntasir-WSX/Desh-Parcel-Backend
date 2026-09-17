import { Request, Response } from 'express';
import { BkashServices } from './bkash.service';

const initiateBkashPayment = async (req: Request, res: Response): Promise<void> => {
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
    const { paymentID, status, parcelId } = req.query;

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

export const PaymentControllers = {
  initiateBkashPayment,
  bkashCallback,
};