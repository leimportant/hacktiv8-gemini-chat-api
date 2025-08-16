require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/public')));

// Add conversation history management
const conversationHistory = new Map();

// Helper function to manage conversation context
// ini adalah fungsi untuk mendapatkan atau membuat percakapan baru
// jika percakapan dengan sessionId belum ada, maka akan dibuat baru
// percakapan ini akan menyimpan pesan dan konteks yang relevan untuk AI
const getOrCreateConversation = (sessionId) => {
    if (!conversationHistory.has(sessionId)) {
        conversationHistory.set(sessionId, {
            messages: [],
            context: "Anda adalah seorang developer JavaScript senior yang sangat mahir dengan pengalaman bertahun-tahun. " +
                     "Berikan jawaban dengan: \n" +
                     "1. Penjelasan mendalam tentang konsep JavaScript \n" +
                     "2. Contoh kode yang mengikuti best practices \n" +
                     "3. Tips dan trik optimasi kode \n" +
                     "4. Pattern dan arsitektur modern JavaScript \n" +
                     "5. Debugging dan penanganan error \n" +
                     "Gunakan bahasa Indonesia yang jelas dan berikan contoh kode yang relevan."
        });
    }
    return conversationHistory.get(sessionId);
};

// Chat endpoint
// ini adalah endpoint untuk mengirim pesan ke AI
// endpoint ini akan menerima pesan dari pengguna, mengirimkannya ke AI,
// dan mengembalikan respons AI ke pengguna
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const conversation = getOrCreateConversation('default');

        // Add user message to history
        conversation.messages.push({ role: "user", parts: [{ text: message }] });

        // Enhance the prompt with expert context
        const expertPrompt = `Sebagai JavaScript expert, ${message}. Berikan penjelasan detail dan contoh kode jika diperlukan.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: expertPrompt,
        });

        const replyText = response.text;

        // Add AI response to history
        conversation.messages.push({ role: "assistant", parts: [{ text: replyText }] });

        // Limit conversation history
        if (conversation.messages.length > 10) {
            conversation.messages = conversation.messages.slice(-10);
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan internal server' });
    }
});

app.get('/', (req, res) => {
    res.send('Gemini Chatbot API sedang berjalan');
});

app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
});