const model = require("../models/suuldUzsenVideo");
const asyncHandler = require("../middleware/asyncHandler");

exports.create = asyncHandler(async (req, res, next) => {
    try {
        const data = {
            ...req.body,
        };
        console.log(data);
        const result = await model.create(data);
        const populatedResult = await result.populate("lessonId")
        return res.status(200).json({ success: true, data: populatedResult });
    } catch (error) {
        console.error("Error occurred while creating:", error);
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
        const text = await model.findById(req.params.id).populate("lessonId")
        return res.status(200).json({ success: true, data: text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.getAll = asyncHandler(async (req, res, next) => {
    try {
        const total = await model.countDocuments();
        const text = await model.find();
        return res.status(200).json({ success: true, total: total, data: text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
