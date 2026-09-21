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

const updateParcelValidationSchema = z.object({
  params: z.object({ id: z.string().uuid('A valid parcel ID is required.') }),
  body: z.object({
    receiverName: z.string().trim().min(2).optional(),
    receiverPhone: z.string().trim().min(7).optional(),
    pickupAddress: z.string().trim().min(2).optional(),
    deliveryAddress: z.string().trim().min(2).optional(),
    weight: z.coerce.number().positive().optional(),
    category: z.string().trim().min(2).optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one parcel field is required.'),
});

const listParcelValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'ASSIGNED', 'PICKED_UP', 'AT_HUB', 'TRANSFER_TO_HUB', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'trackingId', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const ParcelValidation = {
  createParcelValidationSchema,
  updateParcelValidationSchema,
  listParcelValidationSchema,
};