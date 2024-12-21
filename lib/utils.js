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
         <p>Discover our latest collections and exclusive deals.</p>
         <p><a href="keesdeen-abdulmuizz10s-projects.vercel.app/collections/shop_all" style="color: #04BB6E; font-weight: bold;">Shop Now</a></p>`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject,
    html,
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
