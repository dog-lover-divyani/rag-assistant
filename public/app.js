// Local state memory configuration
let uploadedDocumentText = "";
let chatHistory = [];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const statusBadge = document.getElementById('statusBadge');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const queryInput = document.getElementById('queryInput');
const sendBtn = document.getElementById('sendBtn');

// Trigger upload selector clicking
dropZone.addEventListener('click', () => fileInput.click());

// File drag & drop states
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });

// Process files internally to base64 encoding strings
function handleFile(file) {
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        alert('Invalid file format. Please upload either a .pdf or .txt document');
        return;
    }

    const reader = new FileReader();
    appendMessage('system', `Syncing knowledge base layers for "${file.name}"...`);

    if (file.type === 'text/plain') {
        // Simple processing for plain text documents
        reader.onload = function () {
            uploadedDocumentText = reader.result;
            activateWorkspaceContext(file.name);
        };
        reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
        // High-precision browser parsing for PDF layout streams
        reader.onload = async function () {
            try {
                const typedarray = new Uint8Array(reader.result);
                
                // Point PDFJS to its cloud worker thread setup
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullExtractedText = "";

                // Loop over every single page to pull text out neatly
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullExtractedText += pageText + "\n";
                }

                uploadedDocumentText = fullExtractedText.replace(/\s+/g, ' ').trim();

                if (uploadedDocumentText.length < 10) {
                    throw new Error("No selectable text vectors detected in this layout document.");
                }

                activateWorkspaceContext(file.name);

            } catch (err) {
                console.error("PDF extraction malfunction:", err);
                appendMessage('system', `Parsing failure: Unable to capture visible fonts. Ensure the file layer isn't a scanned image layout.`);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

// Helper function to update your workspace UI states neatly
function activateWorkspaceContext(fileName) {
    statusBadge.className = "status-badge connected";
    statusBadge.textContent = "Context Active";
    fileList.innerHTML = `<div class="file-item"><span>📄 ${fileName}</span>✅</div>`;
    queryInput.disabled = false;
    sendBtn.disabled = false;
    queryInput.placeholder = "Ask a question about this document...";
    
    appendMessage('system', `Success! High-fidelity context established with "${fileName}". Ask away!`);
}

// Manage message submission loops
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query || !uploadedDocumentText) return;

    queryInput.value = "";
    appendMessage('user', query);

    // Disable elements while awaiting response
    queryInput.disabled = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, documentContext: uploadedDocumentText, history: chatHistory })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        appendMessage('ai', data.reply);
        chatHistory.push({ role: 'user', text: query });
        chatHistory.push({ role: 'model', text: data.reply });
    } catch (err) {
        appendMessage('system', `Communication failure: ${err.message}`);
    } finally {
        queryInput.disabled = false;
        sendBtn.disabled = false;
        queryInput.focus();
    }
});

// Render conversational blocks within DOM layouts
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}