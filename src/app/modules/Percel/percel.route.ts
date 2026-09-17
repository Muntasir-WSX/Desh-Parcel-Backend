import { Router } from 'express';
import { ParcelControllers } from './percel.controller';
import auth from '../../middlewares/auth';
import { uploadParcelImage } from '../../middlewares/fileUpload';

const router = Router();

router.post('/', auth('CUSTOMER', 'ADMIN'), uploadParcelImage, ParcelControllers.createParcel);
router.get('/', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), ParcelControllers.getAllParcels);
router.get('/:id', auth('CUSTOMER', 'RIDER', 'ADMIN', 'MODERATOR'), ParcelControllers.getParcelById);
router.patch('/:id', auth('CUSTOMER', 'ADMIN'), ParcelControllers.updateParcel);
router.delete('/:id', auth('CUSTOMER', 'ADMIN'), ParcelControllers.deleteParcel);

export const ParcelRoutes = router;