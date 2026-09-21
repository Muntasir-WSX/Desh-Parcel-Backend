import { z } from 'zod';

const idParams = z.object({ params: z.object({ id: z.string().uuid('A valid parcel ID is required.') }) });

const statusSchema = idParams.extend({
  body: z.object({
    status: z.enum(['PICKED_UP', 'AT_HUB', 'TRANSFER_TO_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'CANCELLED']),
    note: z.string().trim().max(500).optional(),
  }),
});

const deliverySchema = idParams.extend({
  body: z.object({ otp: z.string().trim().length(4, 'Delivery OTP must be 4 digits.') }),
});

const cashoutSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive().min(100, 'Minimum cashout amount is 100 BDT.'),
    bkashNo: z.string().trim().min(7, 'A valid bKash number is required.'),
  }),
});

export const RiderValidation = { idParams, statusSchema, deliverySchema, cashoutSchema };