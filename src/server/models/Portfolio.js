import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String }, // e.g., 'Mugs', 'Shirts', 'Banners'
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Portfolio', portfolioSchema);