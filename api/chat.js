import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // Set CORS headers so the browser accepts the communication pipeline cleanly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, documentContext, history } = req.body;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({ error: 'Gemini API environment credential configuration missing.' });
        }

        // Initialize the official Google GenAI Client
        const ai = new GoogleGenAI({ apiKey });

        const promptText = `
            You are an expert workspace assistant. You must answer the following user query accurately using ONLY the attached training context.
            If the answer cannot be formulated from the context, politely state that the information isn't available within the document.

            DOCUMENT CONTEXT:
            """
            ${documentContext}
            """
        `;

        // Format history according to the latest content specifications
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Append the new query prompt alongside the grounding instructions
        contents.push({ 
            role: 'user', 
            parts: [{ text: `${promptText}\n\nUSER QUERY: ${query}` }] 
        });

        // Trigger Google's high-efficiency Gemini Flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents
        });

        // Ensure we extract and return the raw output text string cleanly
        const responseText = response.text || "I was unable to process a text stream summary.";

        return res.status(200).json({ reply: responseText, error: null });

    } catch (error) {
        console.error('Gemini Execution Failure:', error);
        return res.status(200).json({ 
            reply: "The AI module ran into an execution error. Please verify your Gemini API key restrictions or network limits.",
            error: error.message 
        });
    }
}