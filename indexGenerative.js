require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Fixed import

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Gemini Chatbot API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});