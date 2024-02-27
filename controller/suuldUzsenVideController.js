const model = require("../models/suuldUzsenVideo");
const asyncHandler = require("../middleware/asyncHandler");


exports.create = asyncHandler(async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createUser: req.userId
        };
        const result = await model.create(data);
        return res.status(201).json({ success: true, data: result });
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
        // const lessonVideo = req.params.id;
        const find = {
            _id: req.params.id,
            createUser: req.userId
        };
        const text = await model.find(find);

        if (!text) {
            return res.status(404).json({ success: false, message: "Data not found" });
        }
        if (!text[0].createUser) {
            return res.status(404).json({ success: false, message: "customer not found" });
        }
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
