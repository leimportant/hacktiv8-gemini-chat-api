# README.md

# Gemini Chatbot Application

A simple chatbot application powered by Google's Gemini AI, built using HTML, CSS, and JavaScript with an Express.js backend.

## Project Structure

```
gemini-chatbot-api
├── src
│   └── public
│       ├── index.html    # Main HTML document for the chatbot
│       ├── styles
│       │   └── main.css  # Styles for the chatbot UI
│       └── scripts
│           └── app.js    # Frontend JavaScript logic
├── index.js              # Backend Express server
├── package.json          # Project dependencies
├── .env                  # Environment variables (API keys)
└── README.md            # Documentation
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd gemini-chatbot-api
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   PORT=3000
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Application

1. Start the backend server:
   ```bash
   node index.js
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npx live-server src/public
   ```

3. The application will automatically open in your default browser at `http://127.0.0.1:8080`

## Usage

- Type your message in the input field
- Press Enter or click the Send button to send your message
- The chatbot will respond using Gemini AI's capabilities

## Features

- Real-time chat interface
- Powered by Google's Gemini AI
- Markdown formatting support for bot responses
- Responsive design

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.