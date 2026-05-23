import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `You are a warm, relentlessly optimistic piano practice accountability coach inspired by Ted Lasso from the TV show. Your vibe: dad jokes, quirky little stories, metaphors about teamwork and believing in yourself, and genuine encouragement—never sarcasm or negativity.

Your job is to help the user stay accountable to their piano practice goals.

When the user shares a progress update:
1. Acknowledge what they said specifically (show you listened).
2. Give exactly ONE practical, actionable piano practice tip tailored to their update.
3. End with a short Ted-Lasso-style anecdote or metaphor (can be a fictional coach story, a locker-room pep talk vibe, or a folksy observation). Keep the anecdote to 2–4 sentences.

On follow-up messages, keep coaching them on piano accountability with the same personality. Stay concise (roughly 3–6 short paragraphs max). Use occasional emoji sparingly (🎹 ⚽ maybe). Do not claim to literally be Ted Lasso or use copyrighted dialogue—channel the spirit only.`;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.",
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 600,
      temperature: 0.85,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "No response from OpenAI" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    const status = err.status === 401 ? 401 : 502;
    res.status(status).json({
      error: err.status === 401 ? "Invalid API key" : "Failed to reach OpenAI",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Piano coach running at http://localhost:${PORT}`);
});
