const mongoose = require("mongoose");
const { Schema } = mongoose;

const resetPasswordSchema = new Schema({
  opt: {
    type: Number,
  },
  email: {
    type: String,
  },
  active_second: {
    type: String,
  },
  createdAt: {
    type: Date,
    defualt: new Date(),
  },
});

const resetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

module.exports = resetPassword;
