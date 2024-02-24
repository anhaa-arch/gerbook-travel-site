const model = require("../models/additional");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/pagination");

exports.create = asyncHandler(async (req, res) => {
  try {
    // Access files using req.files['fieldName']
    const coverFileName = req.files["cover"]
      ? req.files["cover"][0].filename
      : "no-photo.png";
    const logoFileName = req.files["logo"]
      ? req.files["logo"][0].filename
      : "no-photo.png";

    const input = {
      ...req.body,
      cover: coverFileName, // Assuming you want to save the cover filename in 'cover'
      logo: logoFileName, // And the logo filename in 'logo'
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
    const { id } = req.params;
    const oldData = model.findById(id);
    const coverFileName = req.files["cover"]
      ? req.files["cover"][0].filename
      : oldData.cover;
    const logoFileName = req.files["logo"]
      ? req.files["logo"][0].filename
      : oldData.logo;
    const input = {
      ...req.body,
      logo: logoFileName,
      cover: coverFileName,
    };

    const newItem = await model.findByIdAndUpdate(id, input, {
      new: true,
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

exports.get = asyncHandler(async (req, res, next) => {
  try {
    const text = await model.find();
    return res.status(200).json({
      success: true,
      data: text[0],
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
