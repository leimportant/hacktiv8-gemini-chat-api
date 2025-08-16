let currentSessionId = localStorage.getItem('chatSessionId') || 
                      'session_' + Date.now();
localStorage.setItem('chatSessionId', currentSessionId);

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (!chatBox || !userInput || !sendButton) {
        console.error('Required elements not found in the DOM');
        return;
    }

    function formatMessage(text) {
        if (!text) return '';
        
        return text.split('\n').map(line => {
            // Handle code blocks
            if (line.trim().startsWith('```')) {
                const code = line.replace(/```/g, '');
                return `<pre><code>${code}</code></pre>`;
            }
            // Handle inline code
            if (line.includes('`')) {
                line = line.replace(/`(.*?)`/g, '<code>$1</code>');
            }
            return `<p>${line}</p>`;
        }).join('');
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = isUser ? content : formatMessage(content);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv; // Return the DOM element
    }

    async function sendMessage(message) {
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message,
                    sessionId: currentSessionId 
                })
            });

            const data = await response.json();
            console.log('Response from server:', data); // Debug log
            return data.reply || 'No response received';
        } catch (error) {
            console.error('Error:', error);
            return 'Maaf, terjadi kesalahan. Silakan coba lagi.';
        }
    }

    async function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        const loadingDiv = addMessage('Thinking...');
        
        try {
            const response = await sendMessage(message);
            if (loadingDiv && loadingDiv.parentNode) {
                chatBox.removeChild(loadingDiv);
            }
            if (response) {
                addMessage(response);
            } else {
                addMessage('Maaf, tidak ada respons dari server.');
            }
        } catch (error) {
            if (loadingDiv && loadingDiv.parentNode) {
                chatBox.removeChild(loadingDiv);
            }
            // jika ada error, tampilkan pesan kesalahan
            addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.');
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });
});