const mongoose = require("mongoose");
const { Schema } = mongoose;

const districtSchema = new Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("District", districtSchema);

module.exports = Invoice;
