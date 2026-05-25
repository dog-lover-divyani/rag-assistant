# 🚀 Enterprise AI RAG Assistant Workspace

A high-performance, full-stack **Retrieval-Augmented Generation (RAG)** workspace that allows users to upload local documentation (PDF/TXT) and have secure, contextual, lightning-fast chat conversations with an AI assistant. Built on a serverless microservices architecture and integrated natively with Google’s flagship **Gemini 2.5 Flash** model.

🏠 **Local Testing URL:** `http://localhost:3000`  
🌐 **Live Deployment:** Powered seamlessly by Vercel Serverless Functions

---

## 🔥 What Makes This Tool Different From Other AI Readers?

If you can already upload a PDF to ChatGPT, Gemini, or Claude web interfaces, why build this? This custom workspace is fundamentally different in how it handles data privacy, computing architecture, and accuracy control:

* **🔒 Zero-Cloud Local Extraction (Data Privacy):** Standard AI tools upload your entire physical document to their external corporate cloud servers to parse it. This application uses a decoupled parsing architecture via **Mozilla's PDF.js** right inside the user's browser. The physical file never leaves your machine—only clean text vectors are securely processed.
* **⚡ Serverless Cost Optimization:** Unlike massive SaaS platforms running heavy backend Python servers 24/7 to process PDFs, this tool utilizes light, asynchronous Node.js serverless edge endpoints. It spins up in milliseconds to execute a query and spins down instantly to keep computing overhead at absolute zero.
* **🎯 Hard Context Grounding (No Hallucinations):** Commercial AI tools often mix your document's information with their general public training data, leading to subtle, dangerous hallucinations. This system forces a strict semantic rule layer on Gemini: **Answer using ONLY the parsed document text.** If the facts are missing from the file, it cleanly informs the user instead of guessing.

---

## 🛠️ Tech Stack & Architecture

* **Frontend User Interface:** Pure Semantic HTML5, Custom Responsive CSS3 Grid systems, and Vanilla JavaScript (ES6+).
* **Document Parsing Engine:** `pdfjs-dist` (Mozilla’s high-fidelity text-vector extraction engine).
* **Backend Cloud Runtime:** Node.js serverless architecture natively optimized for Vercel Functions.
* **Core Intelligence Engine:** Google Gemini Developer REST API (`gemini-2.5-flash`).

---

## 📁 Project Directory Structure

```text
rag-assistant/
├── api/
│   ├── chat.js          # Native REST endpoint communicating with Gemini Flash
│   └── upload.js        # Serverless payload gateway protection configuration
├── public/
│   ├── app.js           # Core client engine, UI handler, and Mozilla parser link
│   ├── index.html       # Workspace UI dashboard interface
│   └── style.css        # Cyberpunk-dark workspace theme layout
├── .env                 # Protected local runtime environment credentials
├── package.json         # Node runtime version lock tracking
└── vercel.json          # Deployment routing overrides configuration
```
---
# 🚀 How to Run and Test Locally
**1. Prerequisites**
Ensure you have Node.js installed on your system.

**2. Clone and Install Dependencies**

```text
git clone [https://github.com/your-username/rag-assistant.git](https://github.com/your-username/rag-assistant.git)
cd rag-assistant
npm install -g vercel
```
**3. Setup Your Local Environment Key**
Create a .env file in the main root directory of the project and insert your Google AI Studio API key:
```text
GEMINI_API_KEY=AIzaSyYourActualCopiedKeyStringHere
```

**4. Run the Local Development Server**
Spin up Vercel's local cloud simulation environment:
```text
vercel dev
```
**Open your browser and navigate to 👉 *http://localhost:3000***

---

# 🛡️ Overcoming Engineering Challenges
During development, several platform integration hurdles were solved:

Vercel 4.5MB Serverless Payload Limits: Replaced traditional heavy backend binary multi-part upload libraries with ultra-fast, local client-side array-buffer processing loops.

Google SDK Routing Upgrades: Swapped fluctuating SDK libraries for a clean, stable native web fetch routing pipeline directed straight at Google’s production v1beta/models/gemini-2.5-flash API endpoint cluster.

💼 Developed with ❤️ by Divyani Nigam as a production-grade showcase project.

---
## 🔗 LINK FOR THE WEBSITE - https://rag-assistant-flax.vercel.app/
