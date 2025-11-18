import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as YWS from 'y-websocket';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const httpServer = createServer(app);

// Middleware for parsing JSON bodies
app.use(express.json());

// REPLACE WITH YOUR ACTUAL KEY.
const ai = new GoogleGenAI({
    apiKey: "", 
    apiBaseUrl: "https://generativelanguage.googleapis.com",
});

// Map to store Y.Doc instances for different documents
const docs = new Map();

// --- 1. FRONTEND ROUTE (Serve index.html) ---
// This route is kept minimal, but ideally, you should serve a 'dist' folder.
app.get('/', (req, res) => {
    // NOTE: This assumes your HTML file is named 'index.html' and is in the project root.
    // If you are using Angular/React/Vue, this needs to point to the 'dist' folder.
    res.sendFile(path.join(process.cwd(), 'index.html'));
});


// --- 2. REAL-TIME COLLABORATION SETUP (WS & Yjs) ---
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (conn, req) => {
    const docName = 'document-123';
    
    if (!docs.has(docName)) {
        docs.set(docName, new Y.Doc());
    }
    const doc = docs.get(docName);

    YWS.setupWSConnection(conn, req, doc, { docName });
    
    console.log(`User connected to document: ${docName}`);
});


// --- 3. GEMINI API CODE COMPLETION SERVICE (Express Route) ---

app.post('/api/complete-code', async (req, res) => {
    // 💡 FIX: Destructuring both 'code' and 'language'
    const language = "Javscript"
    const { code} = req.body; 
    
    // Logging: Incoming request data
    console.log(`--- CODE COMPLETION REQUEST ---`);
    // console.log(`Language: ${language}`);
    console.log(`Snippet length: ${code.length}`);
    console.log(`Snippet (last 50 chars): "${code.trim().substring(code.length - 50)}"`);
    console.log('-------------------------------');

    // LATEST PROMPT: Highly explicit rules to ensure a concise, clean completion (like 'b;')
    // 💡 FIX: Prompt template MUST use the 'language' variable, not 'code'
    const prompt = `You are an expert ${language} code assistant. You are given a ${language} code snippet, and your task is to continue the snippet with the **single most likely and relevant continuation**.

    RULES:
    1. **ONLY** return the raw, unformatted code segment that continues the snippet.
    2. Do not include any surrounding characters, explanations, newlines, or markdown formatting (e.g., no \`\`\` blocks).
    3. The continuation should be brief and functional.
    4. **If the snippet ends with an operator (+, -, *, /) or a partial expression, provide the next logical variable, value, or function call (e.g., if ending with 'a + ', return 'b;').**
    5. MUST provide a suggestion if a logical continuation exists.

    CODE SNIPPET (END HERE):
    ${code}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.2,
                maxOutputTokens: 150
            }
        });
        
        let completionText = response.text;
        
        // Robust cleanup
        completionText = completionText
            .replace(/^```[a-z]*\n/i, '')
            .replace(/\n```$/, '')
            .trim();

        // Logging: Successful result
        console.log(`✅ SUCCESS: Completion Text: "${completionText}"`);
        console.log('---------------------------------------------');

        res.json({ completion: completionText });
    } catch (error) {
        // Logging: API Error details
        console.error('❌ FATAL Gemini API Error:', error.message);
        console.log('---------------------------------------------');
        res.status(500).json({ error: 'Failed to fetch code completion' });
    }
});


// --- 4. START SERVER ---

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});