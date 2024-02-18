const model = require("../models/invoice-model.js");
const courseModel = require("../models/course-model.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const { addSeconds } = require("../middleware/addTime.js");
const invoiceModel = require("../models/invoice-model.js");

exports.create = asyncHandler(async (req, res, next) => {
  try {
    const { Course } = req.body;
    const courses = await Promise.all(
      Course.map((courseId) => courseModel.findById(courseId))
    );
    console.log(courses);
    const totalPrice = courses.reduce(
      (total, course) => total + course.price,
      0
    );

    const invoiceCreate = await invoiceModel.create({
      courseId: Course.map((course) => course._id),
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
