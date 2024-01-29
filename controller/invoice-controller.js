const model = require("../models/invoice-model.js");
const itemModel = require("../models/lesson-model.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const { addSeconds } = require("../middleware/addTime.js");

exports.create = asyncHandler(async (req, res, next) => {
  try {
    // const { days } = req.body // garaas hugatsaag oruulna
    const rentDate = addSeconds(new Date(), 100);
    const rentDateStr = rentDate.toISOString().slice(0, 19);
    const nowDate = addSeconds(new Date(), 0);
    const nowDateStr = nowDate.toISOString().slice(0, 19);
    console.log("Одоогийн он сар өдөр ", nowDateStr);
    console.log("Түрээс төлөх он сар ", rentDateStr);

    const data = [];
    const items = await itemModel.find().select("createUser renterUser price");
    for (const item of items) {
      if (item.renterUser !== null) {
        console.log(item._id);
        const result = await model.create({
          item: item._id,
          createdInvoiceDateTime: rentDate,
        });
        const populatedResult = await model.populate(result, {
          path: "item",
          select: "price",
          populate: [
            {
              path: "createUser",
              select: "name phone",
            },
            {
              path: "renterUser",
              select: "name phone",
            },
          ],
        });
        data.push(populatedResult);
      }
    }
    // const numberOfMonths = 12; // Replace this with your variable
    // setTimeout(async () => {
    //   const deletePhoneDelay = await user_verify.findOneAndDelete({
    //     phone: response.phone,
    //   });
    //   console.log("deleted", deletePhoneDelay);
    // }, numberOfMonths * 30 * 24 * 60 * 60 * 1000);
    return res.status(200).json({ success: true, data });
  } catch (error) {
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
