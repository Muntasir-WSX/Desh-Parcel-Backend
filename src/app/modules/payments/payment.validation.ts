import { z } from 'zod';

const parcelBodySchema = z.object({
  body: z.object({ parcelId: z.string().uuid('A valid parcel ID is required.') }),
});

const parcelParamsSchema = z.object({
  params: z.object({ parcelId: z.string().uuid('A valid parcel ID is required.') }),
});

const bkashCallbackSchema = z.object({
  query: z.object({
    paymentID: z.string().min(1),
    status: z.string().min(1),
    parcelId: z.string().uuid(),
  }),
});

const sslSuccessSchema = z.object({
  query: z.object({
    parcelId: z.string().uuid(),
    tran_id: z.string().min(1),
    val_id: z.string().min(1),
  }),
});

const sslResultSchema = z.object({ query: z.object({ parcelId: z.string().uuid() }) });

export const PaymentValidation = {
  parcelBodySchema,
  parcelParamsSchema,
  bkashCallbackSchema,
  sslSuccessSchema,
  sslResultSchema,
};