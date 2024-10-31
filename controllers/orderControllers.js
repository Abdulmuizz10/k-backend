import OrderModel from "../models/orderModel.js";

// Create a new order
const createOrderController = async (req, res) => {
  try {
    const order = new OrderModel(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (Admin use)
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await OrderModel.find().populate(
      "user",
      "firstName lastName email"
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an order by ID
const getOrderByIdController = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "firstName lastName email"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order to paid
// export const updateOrderToPaidController = async (req, res) => {
//   try {
//     const order = await OrderModel.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.isPaid = true;
//     order.paidAt = new Date();
//     order.paymentResult = {
//       id: req.body.id,
//       status: req.body.status,
//       update_time: req.body.update_time,
//       email_address: req.body.email_address,
//     };

//     const updatedOrder = await order.save();
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Update order to delivered
const updateOrderToDeliveredController = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for a specific user
const getOrdersByUserController = async (req, res) => {
  try {
    const orders = await OrderModel.find({ user: req.user.id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderToDeliveredController,
  getOrdersByUserController,
};
