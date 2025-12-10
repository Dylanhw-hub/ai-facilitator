import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'facilitator';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [touchpoint] = useState(1); // Default to touchpoint 1 (after Pit Wall)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start the facilitation
  useEffect(() => {
    if (!conversationStarted) {
      startFacilitation();
    }
  }, [conversationStarted]);

  const startFacilitation = async () => {
    setConversationStarted(true);
    setLoading(true);

    try {
      const response = await fetch('/api/facilitator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          touchpoint: touchpoint,
          isOpening: true,
        }),
      });

      const data = await response.json();
      setMessages([{ role: 'facilitator', content: data.response }]);
    } catch (error) {
      console.error('Error starting facilitation:', error);
      setMessages([{ role: 'facilitator', content: 'I apologize, there was an error starting the facilitation. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/facilitator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          touchpoint: touchpoint,
          isOpening: false,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'facilitator', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'facilitator', content: 'I apologize, there was an error processing your response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="facilitator-container">
        <div className="facilitator-header">
          <h1>AI Facilitator</h1>
          <p>Reflecting on the I-Model</p>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message message-${message.role}`}>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message message-facilitator">
              <div className="message-content">
                <span className="loading-indicator">Facilitator is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={loading}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="send-button">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
