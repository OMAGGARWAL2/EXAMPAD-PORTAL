const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI Controller
 * Encapsulates business logic for AI processing
 */
exports.askAI = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required for processing." });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        res.json({
            reply: response.choices[0].message.content,
            processing_time: new Date().toISOString()
        });

    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ error: "Inference Engine Exception" });
    }
};
