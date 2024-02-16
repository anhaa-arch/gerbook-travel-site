const model = require("../models/lesson-model.js");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/pagination");

exports.create = asyncHandler(async (req, res) => {
  try {
    const user = req.userId;
    const fileName1 = req.file?.filename;
    const input = {
      ...req.body,
      createUser: user,
      video: fileName1,
    };

    const newItem = await model.create(input);

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.update = asyncHandler(async (req, res) => {
  try {
    const user = req.userId;
    const fileName1 = req.files["video"]
      ? req.files["video"][0].filename
      : "no video ?";

    const input = {
      ...req.body,
      video: req.files?.["video"]?.[0]?.filename || null,
    };

    const newItem = await model.findByIdAndUpdate(req.params.id, input, {
      new: true,
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

exports.getCategorySortItem = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort;
    const minPrice = req.query.minPrice || 0;
    const maxPrice = req.query.maxPrice;
    const select = req.query.select;
    let search = req.query.search;

    // Remove unnecessary properties from req.query
    [
      "select",
      "sort",
      "page",
      "limit",
      "search",
      "maxPrice",
      "minPrice",
    ].forEach((el) => delete req.query[el]);

    const pagination = await paginate(page, limit, model);
    if (!search) search = "";

    const query = {
      ...req.query,
      course: req.params.course_id,
    };
    if (!isNaN(maxPrice)) {
      query.price = { $lte: maxPrice };
    }
    const text = await model
      .find(query, select)
      .sort(sort)
      .skip(pagination.start - 1)
      .limit(limit);
    return res.status(200).json({
      success: true,
      pagination,
      count: text.length,
      data: text,
    });
  } catch (error) {
    // Handling errors
    return res.status(500).json({ success: false, error: error.message });
  }
});

// exports.getCategorySortItem = asyncHandler(async (req, res, next) => {
//   try {
//     const { course_id } = req.params
//     const query = {
//       ...req.query,
//       course: course_id
//     };
//     const text = await model.find(query);
//     return res.status(200).json({
//       success: true,
//       count: text.length,
//       data: text,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });

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

exports.getAll = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort;
    const minPrice = req.query.minPrice || 0; // Convert to a number
    const maxPrice = req.query.maxPrice; // Convert to a number
    const select = req.query.select;
    let search = req.query.search;
    [
      "select",
      "sort",
      "page",
      "limit",
      "search",
      "maxPrice",
      "minPrice",
    ].forEach((el) => delete req.query[el]);
    const pagination = await paginate(page, limit, model);
    if (!search) search = "";
    const query = {
      ...req.query,
      title: { $regex: search, $options: "i" },
      price: { $gte: minPrice },
    };
    if (!isNaN(maxPrice)) {
      query.price.$lte = maxPrice;
    }
    const pure = await model.find().populate("course");
    const text = await model
      .find(query, select)
      .populate({
        path: "Category",
        select: "categoryName , photo",
      })
      .populate({
        path: "createUser",
        select: "name , phone , email , photo ",
      })
      .sort(sort)
      .skip(pagination.start - 1)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination,
      data: text,
      pure,
    });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
