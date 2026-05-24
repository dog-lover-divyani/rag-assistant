import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Universal headers to prevent browser blockages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, documentContext, history } = req.body;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({ reply: "Configuration flag missing: The Gemini API Key was not detected in Vercel environment variables." });
        }

        // Initialize the highly stable core Google AI driver
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // We target the ultra-fast gemini-1.5-flash engine which accepts heavy context lengths
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

        // Format history payload into a structure the engine reads cleanly
        const formattedContents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Inject the grounding rule alongside the user's query
        formattedContents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${query}` }]
        });

        // Fire the calculation to the AI model
        const result = await model.generateContent({
            contents: formattedContents
        });
        
        const responseText = result.response.text();

        // Send back perfect JSON that the frontend can read without errors
        return res.status(200).json({ reply: responseText });

    } catch (error) {
        console.error('Core AI Engine Crash:', error);
        return res.status(200).json({ 
            reply: `The AI backend ran into an issue processing this request. Details: ${error.message}`
        });
    }
}