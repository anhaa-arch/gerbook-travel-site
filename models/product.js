const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Бүтээгдхүүний  нэр заавал  оруулна уу !"],
  },
  description: {
    type: String,
    required: [true, "Тайлбар оруулна уу "],
  },
  quantity: {
    type: Number,
  },
  section: {
    type: mongoose.Types.ObjectId,
    ref: "Section",
  },
  brand: {
    type: String,
  },
  weight: {
    type: String,
  },
  height: {
    type: String,
  },
  material: {
    type: String,
  },
  company: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
  },
  files: {
    type: [String],
  },
  price: {
    type: Number,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
