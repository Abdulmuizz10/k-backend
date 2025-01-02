// Create a new subscriber
import { sendSubscribersEmail } from "../lib/utils.js";
import SubscriberModel from "../models/subscriberModel.js";

const createSubscriber = async (req, res) => {
  const { email } = req.body;
  try {
    const existingSubscriber = await SubscriberModel.findOne({ email: email });

    if (existingSubscriber) {
      return res.status(400).json({ message: "You've already subscribed!" });
    }

    const subscriber = new SubscriberModel(req.body);
    await subscriber.save();

    res.status(200).json({ message: "Thanks for subscribing!" });
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

const sendEmailToSubscribers = async (req, res) => {
  const { subject, message } = req.body;
  try {
    const subscribers = await SubscriberModel.find();
    if (subscribers.length === 0) {
      return res
        .status(400)
        .json({ message: "No subscribers to send emails to." });
    }

    const emailList = subscribers.map((subscriber) => subscriber.email);

    await sendSubscribersEmail(emailList, subject, message);

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send emails." });
  }
};

export { createSubscriber, getAllSubscribers, sendEmailToSubscribers };
