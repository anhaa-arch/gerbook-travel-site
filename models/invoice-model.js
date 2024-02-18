const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  courseId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  totalPrice: Number,
  sender_invoice_id: {
    type: String,
  },
  qpay_invoice_id: {
    type: String,
  },
  status: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending",
  },
  createdInvoiceDateTime: { type: Date },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
