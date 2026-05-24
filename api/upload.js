import pdfParse from 'pdf-parse';

export const config = {
    api: { bodyParser: { sizeLimit: '4mb' } } // Limits files to 4MB max
};

export default async function handler(req, res) {
    // Enable basic CORS headers for handling requests smoothly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { fileData, fileName, fileType } = req.body;
        if (!fileData) return res.status(400).json({ error: 'No file data received' });

        // Convert base64 string back into a raw data buffer
        const buffer = Buffer.from(fileData, 'base64');
        let extractedText = '';

        if (fileType === 'application/pdf') {
            const parsedPdf = await pdfParse(buffer);
            extractedText = parsedPdf.text;
        } else {
            extractedText = buffer.toString('utf-8');
        }

        // Clean up excessive structural white spaces
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        if (!extractedText) {
            return res.status(400).json({ error: 'Could not extract text content from file.' });
        }

        return res.status(200).json({ text: extractedText, fileName });
    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({ error: 'Failed to process document content' });
    }
}