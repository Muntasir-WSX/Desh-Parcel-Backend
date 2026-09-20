import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { ParcelServices } from './percel.service';

const createParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await ParcelServices.createParcelIntoDB(userId!, req.body, req.file);
    res.status(201).json({ success: true, message: "Parcel booked successfully", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllParcels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await ParcelServices.getAllParcelsFromDB(
      req.query,
      req.user?.id!,
      String(req.user?.role)
    );
    res.status(200).json({ success: true, message: "Parcels fetched successfully", meta: result.meta, data: result.data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getParcelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await ParcelServices.getParcelByIdFromDB(
      parcelId,
      req.user?.id!,
      String(req.user?.role)
    );
    res.status(200).json({ success: true, message: 'Parcel fetched successfully', data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await ParcelServices.updateParcelInDB(
      parcelId,
      req.user?.id!,
      String(req.user?.role),
      req.body,
      req.file
    );
    res.status(200).json({ success: true, message: 'Parcel updated successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteParcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parcelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await ParcelServices.DeleteParcelFromDB(
      parcelId,
      req.user?.id!,
      String(req.user?.role)
    );
    res.status(200).json({ success: true, message: 'Parcel deleted successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const ParcelControllers = {
  createParcel,
  getAllParcels,
  getParcelById,
  updateParcel,
  deleteParcel,
};