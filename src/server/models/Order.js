import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },

 status: {
  type: String,
  default: "Pending",
  enum: [
    "Pending",
    "Processing",
    "Printing",
    "Dispatched",
    "Delivered",
    "Cancelled"
  ]
},
   createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);