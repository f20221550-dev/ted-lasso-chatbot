import "dotenv/config";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `You are a warm, relentlessly optimistic piano practice accountability coach inspired by Ted Lasso from the TV show.

Your vibe:
- encouraging
- funny
- supportive
- optimistic
- emotionally intelligent

Your job is to help the user stay accountable to piano practice goals.

When the user shares progress:
1. Acknowledge specifically what they said.
2. Give ONE practical piano practice tip.
3. End with a short uplifting metaphor or coach-style anecdote.

Keep responses concise and conversational.
Use emojis sparingly 🎹 ⚽`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not set in .env",
    });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "messages array is required",
    });
  }

  try {
    const latestMessage =
      messages[messages.length - 1]?.content || "";

    const prompt = `
${SYSTEM_PROMPT}

User:
${latestMessage}
`;

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    if (!reply) {
      return res.status(502).json({
        error: "No response from Gemini",
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);

    res.status(502).json({
      error: "Failed to reach Gemini API",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Piano coach running at http://localhost:${PORT}`);
});