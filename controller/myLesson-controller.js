const model = require("../models/myLesson-model.js");
const findModel = require("../models/lesson-model.js")
const asyncHandler = require("../middleware/asyncHandler.js");

exports.create = asyncHandler(async (req, res, next) => {
    try {
        const { item } = req.body;
        const existingItem = await findModel.findById(item);
        if (!existingItem) {
            return res.status(404).json({ success: false, message: `${item}-id тай item байхгүй байна` });
        }
        const user = req.userId;
        const data = {
            ...req.body,
            createUser: user
        };
        const newItem = await model.create(data);
        return res.status(200).json({ success: true, data: newItem });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

exports.update = asyncHandler(async (req, res, next) => {
    try {
        const renter = await model.findById(req.params.id)
        console.log("renter  : ", renter.item)

        const addRenterUser = await findModel.findOneAndUpdate({ _id: renter.item }, { renterUser: renter.createUser, status: "offline" }, {
            new: true
        }).select("status").populate({
            path: "createUser",
            select: "name , phone",

        }).populate({
            path: "renterUser",
            select: "name , phone",

        })
        console.log("add user ", addRenterUser.renterUser)
        // const orderingItem = await findModel.findOneAndUpdate({ _id: item }, { status }, { new: true }).select()
        const updatedData = {
            ...req.body
        };
        // const renterUser = await model.findById()
        const text = await model.findByIdAndUpdate(req.params.id, updatedData, {
            new: true
        });

        return res.status(200).json({ success: true, data: text, addRenterUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.findDelete = asyncHandler(async (req, res, next) => {
    try {
        const text = await model.findByIdAndDelete(req.params.id, {
            new: true
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
        const text = await model.find(
            {
                createUser: req.userId
            }
        );
        return res.status(200).json({
            success: true,
            message: "Хүсэлт илгээсэн үл хөдлөхүүд",
            total: total, data: text
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
