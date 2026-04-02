require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

//  Use dynamic port (REQUIRED for Render)
const PORT = process.env.PORT || 5000;

//  Basic middleware
app.use(cors());
app.use(express.json());

//  Health check route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("API is running...");
});

//  Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//  Chat route
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ reply: "Invalid message" });
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for a college CS department.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("Groq error:", err.message);

    res.status(500).json({
      reply: "AI service unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
