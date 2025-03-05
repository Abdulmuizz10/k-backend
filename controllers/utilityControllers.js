import UtilityModel from "../models/utilityModel.js";

const createUtility = async (req, res) => {
  try {
    const utility = await UtilityModel.create(req.body);
    res.status(201).json(utility);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const couponCode = req.body.coupon;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const existingCoupon = await UtilityModel.findOne({
      couponCode: couponCode,
    });

    if (existingCoupon) {
      return res.status(200).json({ message: "Coupon applied successfully!" });
    } else {
      return res.status(400).json({ message: "Invalid coupon!" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUtility = async (req, res) => {
  try {
    const utility = await UtilityModel.findOne();
    if (!utility) {
      return res.status(200).json({
        couponCode: "",
        deliveryFee: 0,
        discount: 0,
      });
    }
    const response = {
      couponCode: utility.couponCode,
      deliveryFee: utility.deliveryFee ?? 0,
      discount: utility.discount ?? 0,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeliveryAndDiscount = async (req, res) => {
  try {
    const utility = await UtilityModel.findOne();
    if (!utility) {
      return res.status(200).json({
        deliveryFee: 0,
        discount: 0,
      });
    }
    const response = {
      deliveryFee: utility.deliveryFee ?? 0,
      discount: utility.discount ?? 0,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUtility = async (req, res) => {
  try {
    const utility = await UtilityModel.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.status(200).json(utility);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  createUtility,
  applyCoupon,
  getUtility,
  getDeliveryAndDiscount,
  updateUtility,
};
