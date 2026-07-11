import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products (Website ke Shop page ke liye)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new product (Admin Panel ke liye)
router.post('/', async (req, res) => {
  const { title, description, price, imageUrl, category } = req.body;
  const newProduct = new Product({ title, description, price, imageUrl, category });
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;