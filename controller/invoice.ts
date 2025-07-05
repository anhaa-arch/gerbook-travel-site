import { Request, Response, NextFunction } from 'express';
import productModel from "../models/product";
import asyncHandler from "../middleware/asyncHandler";
import invoiceModel from "../models/invoice";

interface ProductWithPrice {
  _id: string;
  price: number;
}

interface CreateInvoiceRequest extends Request {
  body: {
    Products: string[];
  };
}

export const create = asyncHandler(async (req: CreateInvoiceRequest, res: Response, next: NextFunction) => {
  try {
    const { Products } = req.body;
    const products = await Promise.all(
      Products.map((courseId) => productModel.findById(courseId))
    ) as ProductWithPrice[];
    
    const totalPrice = products.reduce(
      (total, course) => total + course.price,
      0
    );

    const invoiceCreate = await invoiceModel.create({
      product: Products,
      totalPrice: totalPrice,
    });

    return res
      .status(200)
      .json({ success: true, price: totalPrice, data: invoiceCreate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedData = {
      ...req.body,
    };
    const text = await invoiceModel.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const findDelete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = await invoiceModel.findByIdAndDelete(req.params.id, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = await invoiceModel.findById(req.params.id);
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export const getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await invoiceModel.countDocuments();
    const text = await invoiceModel.find().populate({
      path: "item",
      select: "price",
    });
    return res.status(200).json({ success: true, total: total, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});