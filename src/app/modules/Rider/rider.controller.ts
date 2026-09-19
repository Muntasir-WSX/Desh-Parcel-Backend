import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { RiderServices } from './rider.service';

const getMyAssignedParcels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const result = await RiderServices.getRiderAssignedParcelsFromDB(riderId!);
    res.status(200).json({ success: true, message: 'Assigned parcels fetched successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSingleAssignedParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await RiderServices.getParcelByIdForRiderFromDB(riderId!, parcelId as string);
    res.status(200).json({ success: true, message: 'Parcel details fetched successfully', data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateParcelStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, note } = req.body;

    const result = await RiderServices.updateParcelStatusByRiderFromDB(
      riderId!,
      parcelId as string,
      status,
      note
    );
    res.status(200).json({ success: true, message: `Parcel status updated to ${status} successfully`, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const RiderControllers = {
  getMyAssignedParcels,
  getSingleAssignedParcel,
  updateParcelStatus,
};