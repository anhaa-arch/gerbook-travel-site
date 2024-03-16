const model = require("../models/quiz-model");
const asyncHandler = require("../middleware/asyncHandler");

exports.create = asyncHandler(async (req, res, next) => {
  try {
    const list = req.body;
    list.map(async (list, index) => {
      const pp = { ...list };
      console.log(pp);
      await model
        .create(pp)
        .then(() => console.log("amjilttai"))
        .catch((er) => console.log(er));
    });

    // const data = {
    //   ...req.body,
    // };
    // console.log(count);
    // const result = await model.create(data);
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("error:", error);

    return res.status(500).json({ success: false, error: error.message });
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
    // const lessonVideo = req.params.id;
    const { courseId } = req.body;
    const find = {
      _id: req.params.id,
      createUser: req.userId,
      courseId: courseId,
    };
    const text = await model.find(find);
    console.log(text);
    if (!text) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }
    return res.status(200).json({ success: true, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.getAll = asyncHandler(async (req, res, next) => {
  try {
    // const total = await model.countDocuments();
    const text = await model.find({
      lessonId: req.params.lesson_id,
    });

    return res
      .status(200)
      .json({ success: true, total: text.length, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.get = asyncHandler(async (req, res, next) => {
  try {
    // const total = await model.countDocuments();
    const text = await model.find();

    return res
      .status(200)
      .json({ success: true, total: text.length, data: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
