const model = require("../models/news");
const asyncHandler = require("../middleware/asyncHandler");

exports.create = asyncHandler(async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      photo: req.file ? req.file.filename : "no-photo.png",
    };
    const text = await model.create(data);
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
