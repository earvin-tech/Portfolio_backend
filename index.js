import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware (must be before routes!)
const allowedOrigins = [
  "https://earvintumpao.dev",
  "https://earvinportfolio2.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      // Allow requests with no origin (like curl or mobile apps)
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ CORS blocked for origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Explicitly handle preflight requests
app.options("*", cors());

app.use(express.json());

// Debug CORS origin (optional)
app.use((req, res, next) => {
  console.log("🔍 Origin received:", req.headers.origin);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Contact API is running!");
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Portfolio Contact <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
