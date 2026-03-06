const OpenAI = require("openai");

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { ideaA, techA, ideaB, techB } = req.body;
    const apiKey = (process.env.SAMBANOVA_API_KEY || "").trim();
    if (!apiKey) return res.status(500).json({ error: "Server not configured." });

    const client = new OpenAI({ apiKey, baseURL: "https://api.sambanova.ai/v1" });

    const prompt = `You are BlueprintAI. Compare these two project ideas as a senior architect and return a JSON battle card.

Idea A: "${ideaA}" (Tech: ${techA || 'Standard'})
Idea B: "${ideaB}" (Tech: ${techB || 'Standard'})

Return ONLY raw JSON, no markdown, no backticks:
{
  "projectA": {
    "name": "short project name",
    "complexity": 1-100,
    "feasibility": 1-100,
    "buildTime": "e.g. 2-3 weeks",
    "skillLevel": "Beginner/Intermediate/Advanced",
    "folderCount": 4,
    "fileCount": 12,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"]
  },
  "projectB": {
    "name": "short project name",
    "complexity": 1-100,
    "feasibility": 1-100,
    "buildTime": "e.g. 1-2 weeks",
    "skillLevel": "Beginner/Intermediate/Advanced",
    "folderCount": 3,
    "fileCount": 8,
    "strengths": ["strength1"],
    "weaknesses": ["weakness1", "weakness2"]
  },
  "winner": "A or B",
  "verdict": "One sentence explaining why the winner is stronger."
}`;

    try {
        const response = await client.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });
        let text = response.choices[0].message.content.trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        res.status(200).json(JSON.parse(text));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
