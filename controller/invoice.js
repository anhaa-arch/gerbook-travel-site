const courseModel = require("../models/product.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const invoiceModel = require("../models/invoice.js");

exports.create = asyncHandler(async (req, res, next) => {
  try {
    const { Products } = req.body;
    const products = await Promise.all(
      Products.map((courseId) => courseModel.findById(courseId))
    );
    const totalPrice = products.reduce(
      (total, course) => total + course.price,
      0
    );

    const invoiceCreate = await invoiceModel.create({
      product: Products.map((course) => course._id),
      totalPrice: totalPrice,
    });

    return res
      .status(200)
      .json({ success: true, price: totalPrice, data: invoiceCreate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.update = asyncHandler(async (req, res, next) => {
  try {
    const updatedData = {
      ...req.body,
    };
    const text = await model.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.findDelete = asyncHandler(async (req, res, next) => {
  try {
    const text = await model.findByIdAndDelete(req.params.id, {
      new: true,
    });
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.detail = asyncHandler(async (req, res, next) => {
  try {
    const text = await model.findById(req.params.id);
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.getAll = asyncHandler(async (req, res, next) => {
  try {
    const total = await model.countDocuments();
    const text = await model.find().populate({
      path: "item",
      select: "price",
    });
    return res.status(200).json({ success: true, total: total, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
