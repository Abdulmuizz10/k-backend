import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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

export const sendWelcomeEmail = async (email, firstName) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service provider (e.g., Gmail, Yahoo, etc.)
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL, // Sender's email address
    to: email, // Recipient's email address
    subject: "Welcome to Keesdeen - Start Shopping Today!",
    html: `
        <h1>Welcome to Keesdeen, ${firstName}!</h1>
        <p>We're thrilled to have you join our community of modest shoppers.</p>
        <p>Here's what you can look forward to:</p>
        <ul>
          <li>Exclusive deals and discounts</li>
          <li>Wide selection of top-quality products</li>
          <li>Fast and secure checkout</li>
        </ul>
        <p>Start exploring our latest collections and make the most of your shopping experience today!</p>
        <p><a href="keesdeen-abdulmuizz10s-projects.vercel.app/collections/shop_all" style="color: #04BB6E; font-weight: bold;">Shop Now</a></p>
        <p>If you have any questions or need assistance, our support team is here to help.</p>
        <p>Happy Shopping!</p>
        <p>Best regards,</p>
        <p>The Keesdeen Team</p>
      `,
  });
};

export const formatAmount = (amount, currency) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};
