import { Router } from 'express';
import { ParcelControllers } from './percel.controller';
import auth from '../../middlewares/auth';
import { uploadParcelImage } from '../../middlewares/fileUpload';

import { ParcelValidation } from './parcel.validation';
import validateRequest from '../../middlewares/validateRequest';


const router = Router();

router.post(
  '/', 
  auth('CUSTOMER', 'ADMIN'), 
  uploadParcelImage, 
  validateRequest(ParcelValidation.createParcelValidationSchema), 
  ParcelControllers.createParcel
);

router.get('/', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), ParcelControllers.getAllParcels);
router.get('/tracking/:trackingId', ParcelControllers.getParcelTracking);
router.get('/:id', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), ParcelControllers.getParcelById);
router.patch('/:id', auth('CUSTOMER', 'ADMIN'), uploadParcelImage, ParcelControllers.updateParcel);
router.delete('/:id', auth('CUSTOMER', 'ADMIN'), ParcelControllers.deleteParcel);

export const ParcelRoutes = router;