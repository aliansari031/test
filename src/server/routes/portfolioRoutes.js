import express from 'express';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

// Get all portfolio items (Portfolio page ke liye)
router.get('/', async (req, res) => {
  try {
    const items = await Portfolio.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to portfolio (Admin Panel se upload karne ke liye)
router.post('/', async (req, res) => {
  const { title, description, imageUrl, category } = req.body;
  const newItem = new Portfolio({ title, description, imageUrl, category });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;