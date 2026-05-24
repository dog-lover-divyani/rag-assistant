export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, documentContext, history } = req.body;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({ reply: "Configuration Error: GEMINI_API_KEY environment variable is missing." });
        }

        const systemPrompt = `
            You are a helpful expert RAG Workspace Assistant. 
            You must answer the user's question using ONLY the provided reference text.
            If the answer cannot be formulated from this text, explain nicely that you don't have that context.
            Keep your answers concise, clean, and scannable.

            REFERENCE DOCUMENT TEXT:
            """
            ${documentContext}
            """
        `;

        const formattedContents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        formattedContents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${query}` }]
        });

        // FIXED: Explicitly calling the updated production-grade endpoint route
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: formattedContents })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        } else if (data.error) {
            return res.status(200).json({ reply: `Google API Error: ${data.error.message}` });
        } else {
            return res.status(200).json({ reply: "The document context was successfully parsed, but Gemini returned an unexpected data block. Please try a different query." });
        }

    } catch (error) {
        return res.status(200).json({ reply: `Local server processing trace error: ${error.message}` });
    }
}