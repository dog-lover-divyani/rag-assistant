import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { query, documentContext, history } = req.body;
        
        // Load API Key safely on server-side from Environment Variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'Gemini API Key missing on server environment configuration.' });

        const ai = new GoogleGenAI({ apiKey });

        // Build system prompt instructions containing the uploaded document text data
        const systemInstruction = `
            You are a helpful expert RAG Assistant. 
            You must answer the user's question using ONLY the provided reference text.
            If the answer cannot be confidently formulated from the reference text, explain that you don't have that specific context.
            Always keep your tone professional, concise, and scannable.
            
            REFERENCE CONTEXT:
            """
            ${documentContext}
            """
        `;

        // Format chat log history accurately for the API
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Append current incoming query text
        contents.push({ role: 'user', parts: [{ text: query }] });

        // Trigger Google's high-efficiency Gemini Flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
        });

        return res.status(200).json({ reply: response.text });
    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Error generating response from AI model.' });
    }
}