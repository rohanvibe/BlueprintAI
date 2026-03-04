const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests. Please try again later." }
});

const fallbackTemplate = {
    projectName: "Default Scaffolding",
    folders: [
        {
            name: "src",
            files: [
                { name: "index.html", content: "<!DOCTYPE html>\n<html>\n<head><title>Scaffolded Project</title></head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>" },
                { name: "app.js", content: "console.log('Project Initialized');" }
            ]
        }
    ]
};

app.post("/generate", limiter, async (req, res) => {
    const { idea } = req.body;
    const apiKey = (process.env.SAMBANOVA_API_KEY || "").trim();

    console.log("--- Server-Side (Free Tier) Request ---");
    console.log(`Processing idea: ${idea.substring(0, 50)}...`);

    if (!apiKey) {
        return res.status(500).json({ error: "Server is not configured with an API key." });
    }

    try {
        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.sambanova.ai/v1",
        });

        const prompt = `Act as a Project Architect. Create a logical and detailed project structure for the following idea: "${idea}".
        
        CRITICAL INSTRUCTIONS:
        1. Match the NATURE of the project. If it is a school project, use appropriate folders (e.g., research, diagrams, assets) and file types (e.g., .txt, .md, .pdf-placeholder).
        2. DO NOT assume this is a software development project unless the user mentions coding, apps, or specific programming languages.
        3. If the user asks for a science project, generate folders for "Planets", "Experiments", "Observations", etc.
        4. Provide high-quality, realistic starter content for every file created.
        
        Return ONLY a raw JSON object with NO markdown, NO backticks.
        The JSON must strictly follow this schema:
        {
          "projectName": "string",
          "folders": [
            {
              "name": "string",
              "files": [
                { "name": "string", "content": "string" }
              ]
            }
          ]
        }`;

        const response = await client.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        let text = response.choices[0].message.content.trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            res.json(JSON.parse(text));
        } catch (e) {
            console.error("JSON Parse Error:", e);
            res.json(fallbackTemplate);
        }
    } catch (error) {
        console.error("SambaNova Error Detail:", error.message || error);
        res.status(500).json({ error: `SambaNova API error: ${error.message || "Unknown error"}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running with SambaNova at http://localhost:${PORT}`));
