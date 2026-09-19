import { z } from 'zod';

const createParcelValidationSchema = z.object({
  body: z.object({
    receiverName: z.string({
      message: 'Receiver name is required',
    }),
    receiverPhone: z.string({
      message: 'Receiver phone is required',
    }),
    pickupAddress: z.string({
      message: 'Pickup address is required',
    }),
    deliveryAddress: z.string({
      message: 'Delivery address is required',
    }),
    weight: z.coerce.number({
      message: 'Weight is required and must be a number',
    }).positive('Weight must be a positive number'),
    category: z.string({
      message: 'Category is required',
    }),
  }),
});

export const ParcelValidation = {
  createParcelValidationSchema,
};