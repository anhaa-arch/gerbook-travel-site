import { Request, Response, NextFunction } from 'express';
import model from "../models/category";
import asyncHandler from "../middleware/asyncHandler";

interface FileRequest extends Request {
  file?: {
    filename: string;
  };
}

export const create = asyncHandler(async (req: FileRequest, res: Response, next: NextFunction) => {
  try {
    const body = {
      ...req.body,
      photo: req.file ? req.file.filename : "no-photo.png",
    };

    const data = await model.create(body);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const update = asyncHandler(async (req: FileRequest, res: Response, next: NextFunction) => {
  try {
    const oldData = await model.findById(req.params.id);
    const updatedData = {
      ...req.body,
      photo: req.file ? req.file.filename : oldData?.photo,
    };
    const text = await model.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const findDelete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = await model.findByIdAndDelete(req.params.id, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = await model.findById(req.params.id);
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await model.countDocuments();
    const text = await model.find();
    return res.status(200).json({ success: true, total: total, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});