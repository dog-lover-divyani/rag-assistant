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
    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1];
        appendMessage('system', `Processing text layers inside "${file.name}"... Please wait.`);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileData: base64Data, fileName: file.name, fileType: file.type })
            });
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            // Update in-memory context data state
            uploadedDocumentText = data.text;
            
            // Visual indicators updating
            statusBadge.className = "status-badge connected";
            statusBadge.textContent = "Context Active";
            fileList.innerHTML = `<div class="file-item"><span>📄 ${file.name}</span>✅</div>`;
            queryInput.disabled = false;
            sendBtn.disabled = false;
            queryInput.placeholder = "Ask a question about this document...";
            
            appendMessage('system', `Success! context trained with ${file.name}. Ask your questions below.`);
        } catch (err) {
            appendMessage('system', `Error parsing file: ${err.message}`);
        }
    };
    reader.readAsDataURL(file);
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