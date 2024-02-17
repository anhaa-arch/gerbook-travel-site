const Customer = require("../models/customer-model.js");
const asyncHandler = require("../middleware/asyncHandler");
const customer = require("../models/user");
exports.getAllUser = asyncHandler(async (req, res, next) => {
    try {
        const allUser = await Customer.find();
        const total = await Customer.countDocuments();
        res.status(200).json({
            success: true,
            count: total,
            data: allUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


exports.createCustomer = asyncHandler(async (req, res, next) => {
    try {
        const existingUser = await Customer.findOne({ phone: req.body.phone });
        const existingEmail = await Customer.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "Утасны дугаар бүртгэлтэй байна",
            });
        }
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: "И-мэйл бүртгэлтэй байна",
            });
        }
        const inputData = {
            ...req.body,
            photo: req.file?.filename ? req.file.filename : "no user photo",
        };
        const customer = await Customer.create(inputData);

        // Generate JWT token
        const token = customer.getJsonWebToken();
        res.status(200).json({
            success: true,
            token,
            data: customer,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.Login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await Customer.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "Утасны дугаар бүртгэлгүй байна " });
        }

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Утасны дугаар болон нууц үгээ оруулна уу!",
            });
        }

        const isPasswordValid = await user.checkPassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                msg: "Утасны дугаар эсвэл нууц үг буруу байна!",
            });
        }

        const token = user.getJsonWebToken();

        res.status(200).json({
            success: true,
            token,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


exports.updateUser = asyncHandler(async (req, res, next) => {
    try {
        const updatedData = {
            ...req.body,
            photo: req.file?.filename,
        };

        const upDateUserData = await User.findByIdAndUpdate(
            req.params.id,
            updatedData,
            {
                new: true,
            }
        );
        return res.status(200).json({
            success: true,
            data: upDateUserData,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.userDetail = asyncHandler(async (req, res, next) => {
    try {
        const allText = await Customer.findById(req.params.id);
        return res.status(200).json({
            success: true,
            data: allText,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.deleteUser = async function deleteUser(req, res, next) {
    try {
        const deletePost = await User.findOneAndDelete(req.params.id, {
            new: true,
        });
        return res.status(200).json({
            success: true,
            msg: "Ажилттай усгагдлаа",
            data: deletePost,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Энд дуусаж байгаа шүүү