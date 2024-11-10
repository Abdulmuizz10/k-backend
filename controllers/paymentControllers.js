import { Client, Environment } from "square";

const client = new Client({
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

const createPaymentController = async (req, res) => {
  const { amount, currency, sourceId } = req.body;

  try {
    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: amount * 100,
        currency: currency || "USD",
      },
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export default createPaymentController;
