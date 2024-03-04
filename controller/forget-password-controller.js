const model = require("../models/forget-password-model.js");
const CustomerModel = require("../models/customer-model.js");
const asyncHandler = require("../middleware/asyncHandler");
const { addSeconds } = require("../middleware/addTime.js");
const { sendMail } = require("../utils/mailer.js");

exports.sentEmailVerifyCode = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    // const emailFindtoCustomer = await CustomerModel.findOne({ email: email });

    const endDate = addSeconds(new Date(), 180);
    const endDateStr = endDate.toISOString().slice(0, 19);



    /// TEST DUUSHAAR  COMMENTIINE AWAH



    // if (!emailFindtoCustomer) {
    //   return res
    //     .status(404)
    //     .json({ success: false, error: "Бүртгэлтгүй имэйл хаяг байна" });
    // }

    const verifyCode = Math.floor(1000 + Math.random() * 9000);
    await sendMail({ email, msg: verifyCode });
    const input = {
      opt: verifyCode,
      email: email,
      active_second: endDateStr,
    };

    const createReset = await model.create(input);
    return res.status(200).json({ success: true, data: createReset });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

exports.checkOpt = asyncHandler(async (req, res) => {
  try {
    const { opt, email } = req.body;

    const response = await model.findOne({
      email: email,
      opt: opt,
    });

    const endDate = addSeconds(new Date(), 0);
    const endDateStr = endDate.toISOString().slice(0, 19);

    if (!response) {
      return res.status(200).json({
        success: false,
        statusText: "Баталгаажуулах код буруу байна.",
      });
    }
    if (endDateStr > response.active_second) {
      return res.status(200).json({
        success: false,
        statusText: "Баталгаажуулах кодны хугацаа дууссан байна.",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Амжилттай", response });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 0,
      statusText:
        "Internal Server Error: Something went wrong while processing the request.",
    });
  }
});
