// Create a new subscriber
import SubscriberModel from "../models/subscriberModel.js";

const createSubscriber = async (req, res) => {
  const { email } = req.body;
  try {
    const existingSubscriber = SubscriberModel.find({ email: email });
    if (existingSubscriber) {
      res.status(200).json({ message: "You've already subscribed!" });
    } else {
      const subscriber = new SubscriberModel({ email: email });
      await subscriber.save();
      res.status(200).json({ message: "Thanks for subscribing!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await SubscriberModel.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong!. Unable to get Subscribers" });
  }
};

// const getProductsByPage = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;

//     const products = await ProductModel.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
//     const totalProducts = await ProductModel.countDocuments();
//     const totalPages = Math.ceil(totalProducts / limit);

//     res.status(200).json({ products, totalPages });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export { createSubscriber, getAllSubscribers };
