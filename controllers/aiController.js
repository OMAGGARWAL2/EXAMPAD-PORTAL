const OpenAI = require("openai");

let defaultOpenai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith("sk-")) {
    try {
        defaultOpenai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY.trim()
        });
    } catch (e) {
        console.warn("Failed to initialize default OpenAI instance:", e.message);
    }
}

/**
 * AI Controller - askAI
 * Direct interaction with OpenAI Chat API
 */
exports.askAI = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const customApiKey = req.headers['x-openai-key'] || req.body.apiKey;

        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required." });
        }

        let client = defaultOpenai;
        if (customApiKey && customApiKey.trim().startsWith('sk-')) {
            client = new OpenAI({ apiKey: customApiKey.trim() });
        }

        if (!client) {
            return res.status(400).json({
                error: "OpenAI API Key not configured. Please add OPENAI_API_KEY in .env or provide an API key."
            });
        }

        const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
        const response = await client.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: userMessage }]
        });

        return res.json({
            reply: response.choices[0].message.content,
            processing_time: new Date().toISOString()
        });
    } catch (err) {
        console.error("OpenAI askAI error:", err.message);
        res.status(500).json({ error: "OpenAI Error: " + err.message });
    }
};

/**
 * AI Controller - generateQuestions
 * 100% Exclusively Powered by OpenAI API
 */
exports.generateQuestions = async (req, res) => {
    try {
        const {
            topic,
            prompt,
            type,
            count,
            optionsCount,
            sampleTestCasesCount,
            hiddenTestCasesCount,
            marks,
            difficulty,
            apiKey
        } = req.body;

        const customApiKey = req.headers['x-openai-key'] || apiKey;

        if (!topic && !prompt) {
            return res.status(400).json({ success: false, error: "Topic or prompt is required." });
        }

        const safeTopic = (topic || prompt || "General Knowledge").trim();
        const safeType = type || 'mcq';
        const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 20);
        const numOpts = Math.min(Math.max(parseInt(optionsCount) || 4, 2), 6);
        const numSample = Math.min(Math.max(parseInt(sampleTestCasesCount) || 2, 1), 5);
        const numHidden = Math.min(Math.max(parseInt(hiddenTestCasesCount) || 3, 1), 10);
        const itemMarks = parseInt(marks) || (safeType === 'coding' ? 10 : 1);
        const diff = difficulty || 'medium';

        let client = defaultOpenai;
        if (customApiKey && customApiKey.trim().startsWith('sk-')) {
            client = new OpenAI({ apiKey: customApiKey.trim() });
        }

        if (!client) {
            return res.status(400).json({
                success: false,
                error: "OpenAI API Key is missing. Please set OPENAI_API_KEY in .env or provide your OpenAI API Key."
            });
        }

        const systemPrompt = `You are a principal assessment designer and professor of computer science.
Generate EXACTLY ${numCount} NEW, ORIGINAL, and HIGHLY DISTINCT questions for the requested topic.

CRITICAL INSTRUCTIONS FOR HIGH-QUALITY QUESTIONS:
1. Difficulty level: ${diff}.
2. Questions must test deep conceptual understanding and problem-solving, NOT rote memorization.
3. For MCQs, distribute questions across the following categories:
   - Conceptual & Invariant principles
   - Code-based & Implementation tracing
   - Output prediction & Trace evaluation
   - Time/Space asymptotic complexity analysis
   - Real-world application & Edge-case problem solving
4. Cover relevant core subtopics comprehensively (e.g., if Binary Trees: traversals, BST invariant, LCA, depth/diameter, balancing, serialization).
5. Provide exactly ${numOpts} distinct options with NO ambiguous wording.
6. Ensure the correct answer is unambiguously correct and include an "explanation" field for every question.
7. Strictly NO duplicate questions or repeated concepts.

Output format MUST be a raw JSON array matching this structure:

For MCQ:
[
  {
    "heading": "Descriptive Topic - Subtopic/Angle",
    "title": "<p>Detailed question statement in clean HTML</p>",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact string of Option A",
    "explanation": "Clear, concise technical justification of why this answer is correct.",
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

For Coding:
[
  {
    "heading": "Unique Challenge Title",
    "title": "<p><strong>Problem Statement:</strong> ...</p><p><strong>Input Format:</strong> ...</p><p><strong>Output Format:</strong> ...</p><p><strong>Constraints:</strong> ...</p>",
    "type": "coding",
    "languages": ["Python", "Java", "C++", "JavaScript"],
    "testCases": [
      {"input": "...", "output": "...", "marks": 2, "isSample": true, "explanation": "..."},
      {"input": "...", "output": "...", "marks": 3, "isSample": false}
    ],
    "code": {
      "Python": {"prefix": "", "middle": "def solution():\\n    pass\\n", "suffix": ""},
      "Java": {"prefix": "public class Solution {\\n", "middle": "    public static void solution() {}\\n", "suffix": "}"},
      "C++": {"prefix": "#include <iostream>\\n", "middle": "void solution() {}\\n", "suffix": ""},
      "JavaScript": {"prefix": "", "middle": "function solution() {}\\n", "suffix": ""}
    },
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

For Assertion-Reason:
[
  {
    "heading": "Unique Assertion Title",
    "title": "<p><strong>Assertion (A):</strong> ...</p><p><strong>Reason (R):</strong> ...</p>",
    "type": "assertion_reason",
    "options": [
      "Both (A) and (R) are true and (R) is the correct explanation of (A)",
      "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
      "(A) is true but (R) is false",
      "(A) is false but (R) is true"
    ],
    "correctAnswer": "Both (A) and (R) are true and (R) is the correct explanation of (A)",
    "explanation": "Technical justification of why assertion and reason hold or fail.",
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

For Subjective:
[
  {
    "heading": "Analytical Evaluation Title",
    "title": "<p>Detailed analytical essay / design prompt</p>",
    "type": "subjective",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "marks": ${itemMarks || 5},
    "difficulty": "${diff}"
  }
]

For Numeric:
[
  {
    "heading": "Quantitative Calculation Title",
    "title": "<p>Exact numerical computation question statement</p>",
    "type": "numeric",
    "correctNumeric": 42,
    "tolerance": 0.01,
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

Return ONLY the raw JSON array. No markdown codeblocks (\`\`\`json).`;

        const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
        const completion = await client.chat.completions.create({
            model: modelName,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Topic: ${safeTopic}\nPrompt/Instructions: ${prompt || 'Generate high-caliber, diverse assessment questions'}\nType: ${safeType}\nCount: ${numCount}\nOptions Count: ${numOpts}\nSample Test Cases: ${numSample}\nHidden Test Cases: ${numHidden}`
                }
            ],
            temperature: 0.7
        });

        let raw = completion.choices[0].message.content.trim();
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        
        let parsed = [];
        try {
            parsed = JSON.parse(raw);
        } catch (jsonErr) {
            console.error("OpenAI JSON Parse Error. Raw response:", raw);
            return res.status(500).json({
                success: false,
                error: "Failed to parse OpenAI JSON response: " + jsonErr.message
            });
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            return res.status(500).json({
                success: false,
                error: "OpenAI did not return a valid question array."
            });
        }

        const formatted = parsed.slice(0, numCount).map((q, idx) => ({
            id: 'q_ai_' + Date.now() + '_' + idx,
            ...q
        }));

        return res.json({
            success: true,
            questions: formatted,
            source: "openai"
        });

    } catch (err) {
        console.error("OpenAI Question Generation Error:", err.message);
        return res.status(500).json({
            success: false,
            error: "OpenAI API Error: " + err.message
        });
    }
};

/**
 * Controller to test user API key
 */
exports.testAPIKey = async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey || !apiKey.trim().startsWith('sk-')) {
            return res.status(400).json({ success: false, error: "Invalid API key format. Key must start with sk-" });
        }
        const client = new OpenAI({ apiKey: apiKey.trim() });
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
        });
        return res.json({ success: true, message: "OpenAI API Key verified successfully!" });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};