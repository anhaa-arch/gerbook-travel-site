const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
    required: [true, "Нэр оруулна уу "],
  },
  email: {
    type: String,
    required: [true, "Имэйл  хаяг бичнэ үү"],
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Хүчинтэй имэйл хаяг оруулна уу",
    ],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Нууц үг бичнэ үү"],
    minlength: [8, "Нууц үгийн урт хамгийн багадаа  8 тэмдэгт байна"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "operator"],
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now, // Corrected "defualt" to "default"
  },
  photo: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

companySchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
companySchema.methods.checkPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

companySchema.methods.getJsonWebToken = function () {
  let token = jwt.sign(
    { Id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIREDIN,
    }
  );
  return token;
};
companySchema.pre("findOneAndUpdate", async function (next) {
  if (!this._update.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this._update.password = await bcrypt.hash(this._update.password, salt);
  next();
});

module.exports = mongoose.model("Company", companySchema);
