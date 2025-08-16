require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');  // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message,
        });
        
        res.json({ reply: response.text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Modify the first media analysis endpoint
app.post("/api/analyze-media", upload.single("file"), async (req, res) => {
  const imagePath = req.file?.path;

  try {
    if (!imagePath) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageData = fs.readFileSync(imagePath);
    const imageBase64 = imageData.toString("base64");
    const promptText = req.body.prompt || "Describe this image";

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: imageBase64
              }
            }
          ]
        }
      ]
    });

    // Ambil teks dengan aman
    const replyText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "No description returned";

    res.json({ reply: replyText });

  } catch (error) {
    console.error("Error analyzing media:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
});

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Gemini Chatbot API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});