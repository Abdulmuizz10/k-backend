import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOrderConfirmationEmail = async (
  email,
  firstName,
  lastName,
  totalPrice,
  currency,
  orderedItems,
  orderId
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Order Confirmation",
    html: `
      <h1>Order Confirmation</h1>
      <p>Dear ${firstName} ${lastName},</p>
      <p>Thank you for your order. Here are the details:</p>
      <ul>
        <li><strong>Order ID:</strong> ${orderId}</li>
        <li><strong>Ordered Items:</strong></li>
        <ul>
          ${orderedItems
            .map(
              (item) =>
                `<li>
      <span><strong>${item.qty} x</strong> ${item.name}</span><br/>
      <span><strong>Size:</strong> ${item.size}</span> | 
      <span><strong>Color:</strong> ${item.color}</span><br/>
      <span><strong>Price:</strong> ${formatAmount(item.price, currency)}</span>
                </li>`
            )
            .join("")}

        </ul>
        <li><strong>Total Price:</strong> ${formatAmount(
          totalPrice,
          currency
        )}</li>
      </ul>
      <p>We will notify you once your order has been shipped.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send confirmation email " + error.message);
  }
};

export const sendResetEmailLink = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, firstName, action) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const subject =
    action === "signup"
      ? "Welcome to Keesdeen - Start Shopping Today!"
      : "Welcome Back to Keesdeen!";

  const html =
    action === "signup"
      ? `<h1>Welcome to Keesdeen, ${firstName}!</h1>
         <p>We're thrilled to have you join our community of modest shoppers.</p>
         <p>Explore exclusive deals and discounts today.</p>
         <p><a href="keesdeen-abdulmuizz10s-projects.vercel.app/collections/shop_all" style="color: #04BB6E; font-weight: bold;">Shop Now</a></p>`
      : `<h1>Welcome back to Keesdeen, ${firstName}!</h1>
         <p>We're excited to see you shopping with us again.</p>
         <p>Discover our latest collections and discounts today.</p>
         <p><a href="keesdeen-abdulmuizz10s-projects.vercel.app/collections/shop_all" style="color: #04BB6E; font-weight: bold;">Shop Now</a></p>`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject,
    html,
  });
};

export const sendSubscribersEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: Array.isArray(email) ? email.join(", ") : email, // Handle string or array
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send email: " + error.message);
  }
};

export const formatAmount = (amount, currency) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};
