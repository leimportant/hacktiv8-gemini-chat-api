document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000'; // Use the API URL from config.js

    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const fileUpload = document.getElementById('file-upload');

    function formatMessage(text) {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (let line of lines) {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.trim().substring(2)}</li>`;
        } else if (/^\d+\.\s/.test(line.trim())) {
            if (!inList) {
                html += '<ol>';
                inList = true;
            }
            html += `<li>${line.trim().substring(line.indexOf('.') + 1).trim()}</li>`;
        } else {
            if (inList) {
                html += '</ul>'; // atau </ol> tergantung sebelumnya
                inList = false;
            }
            html += `<p>${line}</p>`;
        }
    }
    if (inList) html += '</ul>'; // tutup list terakhir
    return html;
}


    function addMessage(content, isUser = false, isMedia = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        if (isMedia) {
            if (content.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(content);
                messageDiv.appendChild(img);
            } else if (content.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(content);
                video.controls = true;
                messageDiv.appendChild(video);
            } else if (content.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.src = URL.createObjectURL(content);
                audio.controls = true;
                messageDiv.appendChild(audio);
            }
        } else {
            messageDiv.innerHTML = isUser ? content : formatMessage(content);
        }
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    async function sendMessage(message) {
        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error. Please try again.';
        }
    }

    async function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/analyze-media`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error analyzing the file.';
        }
    }

    async function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        const loadingMessage = addMessage('Thinking...');
        
        try {
            const response = await sendMessage(message);
            chatBox.removeChild(loadingMessage);
            addMessage(response);
        } catch (error) {
            chatBox.removeChild(loadingMessage);
            addMessage('Sorry, something went wrong. Please try again.');
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    fileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        addMessage(file, true, true);
        const loadingMessage = addMessage('Analyzing media...');

        try {
            const response = await handleFileUpload(file);
            chatBox.removeChild(loadingMessage);
            addMessage(response);
        } catch (error) {
            chatBox.removeChild(loadingMessage);
            addMessage('Sorry, something went wrong analyzing the media.');
        } finally {
            fileUpload.value = '';
        }
    });

    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });
});