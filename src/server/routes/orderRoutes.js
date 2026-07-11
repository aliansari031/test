import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Get all orders (Admin Panel me show karne ke liye)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order (Checkout page se submit karne ke liye)
router.post('/', async (req, res) => {
  const { customerName, email, phone, address, items, totalAmount } = req.body;
  const newOrder = new Order({ customerName, email, phone, address, items, totalAmount });
  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

 // Update Order Status (Admin Panel se status change karne ke liye)
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(updatedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
});

// Delete Order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;