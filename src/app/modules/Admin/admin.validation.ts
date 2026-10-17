import { z } from 'zod';

const idParams = z.object({ params: z.object({ id: z.string().uuid('A valid ID is required.') }) });

const roleSchema = idParams.extend({
  body: z.object({ role: z.enum(['CUSTOMER', 'MODERATOR']) }),
});

const assignSchema = z.object({
  body: z.object({ parcelId: z.string().uuid(), riderId: z.string().uuid() }),
});

const hubStatusSchema = idParams.extend({
  body: z.object({ currentHub: z.string().trim().min(2), note: z.string().trim().max(500).optional() }),
});

const deleteParcelSchema = idParams.extend({
  body: z.object({ reason: z.string().trim().max(500).optional() }),
});

const withdrawalStatusSchema = idParams.extend({
  body: z.object({ status: z.enum(['APPROVED', 'REJECTED']) }),
});

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

const auditLogQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    action: z.string().trim().optional(),
    resource: z.string().trim().optional(),
    actorId: z.string().uuid().optional(),
  }),
});



const createBlogSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Blog title is required and must be at least 3 characters.'),
    content: z.string().trim().min(10, 'Blog content is required.'),
    image: z.string().url('Invalid image URL format.').optional(),
  }),
});

const updateBlogSchema = z.object({
  params: z.object({ id: z.string().uuid('A valid Blog ID is required.') }),
  body: z.object({
    title: z.string().trim().min(3).optional(),
    content: z.string().trim().min(10).optional(),
    image: z.string().url().optional(),
  }),
});

// AdminValidation object-e export korun:
export const AdminValidation = {
  idParams,
  roleSchema,
  assignSchema,
  hubStatusSchema,
  deleteParcelSchema,
  withdrawalStatusSchema,
  paginationSchema,
  auditLogQuerySchema,
  createBlogSchema,
  updateBlogSchema,
};