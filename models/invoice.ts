import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  product: mongoose.Types.ObjectId[];
  createdAt: Date;
  totalPrice: number;
  sender_invoice_id?: string;
  qpay_invoice_id?: string;
  status: "paid" | "pending";
  createdInvoiceDateTime?: Date;
  updatedAt: Date;
}

const invoiceSchema: Schema = new Schema({
  product: [
    {
      type: [Schema.Types.ObjectId],
      ref: "Product",
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

export default mongoose.model<IInvoice>("Invoice", invoiceSchema);