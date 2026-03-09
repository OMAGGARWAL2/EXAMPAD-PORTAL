const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
console.log("ENV KEY =", process.env.OPENAI_API_KEY);
const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/ask-ai", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        res.json({
            reply: response.choices[0].message.content
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI failed" });
    }
});

app.listen(3000, () => {
    console.log("AI Server running on port 3000");
});