import { Router } from 'express';
import { ParcelControllers } from './percel.controller';
import auth from '../../middlewares/auth';
import { uploadParcelImage } from '../../middlewares/fileUpload';

import { ParcelValidation } from './parcel.validation';
import validateRequest from '../../middlewares/validateRequest';
import { z } from 'zod';


const router = Router();

router.post(
  '/', 
  auth('CUSTOMER', 'ADMIN'), 
  uploadParcelImage, 
  validateRequest(ParcelValidation.createParcelValidationSchema), 
  ParcelControllers.createParcel
);

router.get('/', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), validateRequest(ParcelValidation.listParcelValidationSchema), ParcelControllers.getAllParcels);
router.get('/tracking/:trackingId', validateRequest(z.object({ params: z.object({ trackingId: z.string().min(1) }) })), ParcelControllers.getParcelTracking);
router.get('/:id', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })), ParcelControllers.getParcelById);
router.patch('/:id', auth('CUSTOMER', 'ADMIN'), uploadParcelImage, validateRequest(ParcelValidation.updateParcelValidationSchema), ParcelControllers.updateParcel);
router.delete('/:id', auth('CUSTOMER', 'ADMIN'), validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })), ParcelControllers.deleteParcel);

export const ParcelRoutes = router;