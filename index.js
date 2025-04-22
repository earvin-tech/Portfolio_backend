import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "https://earvintumpao.dev",             // ✅ Your custom domain
    "https://earvinporfolio2.netlify.app"   // ✅ Your Netlify preview
  ],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: false,
  optionsSuccessStatus: 200, // Unless using cookies, leave this false
}));

app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Contact API is running!");
});

app.options("/api/contact", cors({
  origin: [
    "https://earvintumpao.dev",
    "https://earvinporfolio2.netlify.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  optionsSuccessStatus: 200,
}));


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
      from: `"Portfolio Contact" <contact@earvintumpao.dev>`,
      to: process.env.EMAIL_TO,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
    });
    
    

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

app.get("/api/debug", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json({
    corsActive: true,
    allowedOrigins: [
      "https://earvintumpao.dev",
      "https://earvinporfolio2.netlify.app"
    ],
    message: "Debug route is live",
  });
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
