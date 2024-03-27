const mongoose = require("mongoose");
const { Schema } = mongoose;

const sectionSchema = new Schema({
  name: String,
  district: {
    type: mongoose.Types.ObjectId,
    ref: "District",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("Section", sectionSchema);

module.exports = Invoice;
