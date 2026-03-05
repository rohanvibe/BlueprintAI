const OpenAI = require("openai");

module.exports = async (req, res) => {
    // Add CORS headers for serverless
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea, techStack } = req.body;
    const apiKey = (process.env.SAMBANOVA_API_KEY || "").trim();

    if (!apiKey) {
        return res.status(500).json({ error: "Server is not configured with an API key." });
    }

    try {
        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.sambanova.ai/v1",
        });

        const prompt = `Act as BlueprintAI. Create a logical and detailed project structure for the following idea: "${idea}" using the tech stack: "${techStack || 'Standard Web'}".
        
        CRITICAL INSTRUCTIONS:
        1. Match the NATURE of the project. If it is a school project, use appropriate folders (e.g., research, diagrams, assets) and file types (e.g., .txt, .md, .pdf-placeholder).
        2. DO NOT assume this is a software development project unless the user mentions coding, apps, or specific programming languages.
        3. Provide high-quality, realistic starter content for every file created.
        4. Generate a 'diagram' using Mermaid.js Flowchart syntax (graph TD).
        5. CRITICAL: In the Mermaid diagram, DO NOT use parentheses, quotes, or special characters in node labels. Use clean names like "MainUI" or "DatabaseProcess".
        
        Return ONLY a raw JSON object with NO markdown, NO backticks.
        {
          "projectName": "string",
          "folders": [ { "name": "string", "files": [ { "name": "string", "content": "string" } ] } ],
          "roadmap": ["Step 1", "Step 2", "Step 3"],
          "resources": [ { "label": "Resource Name", "url": "https://..." } ],
          "presentationTips": ["Tip 1", "Tip 2"],
          "initialInsight": "Brief expert commentary.",
          "scorecard": { "feasibility": 1-100, "complexity": 1-100, "rating": "A-TIER/B-TIER/S-TIER" },
          "diagram": "graph TD\\n  A[Start] --> B[Process]"
        }`;

        const response = await client.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        let text = response.choices[0].message.content.trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            res.status(200).json(JSON.parse(text));
        } catch (e) {
            console.error("JSON Parse Error:", e);
            res.status(500).json({ error: "AI returned invalid JSON" });
        }
    } catch (error) {
        console.error("AI Error:", error.message || error);
        res.status(500).json({ error: `AI error: ${error.message || "Unknown error"}` });
    }
};
