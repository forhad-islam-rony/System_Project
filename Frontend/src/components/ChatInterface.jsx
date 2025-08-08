/**
 * @fileoverview Chat Interface Component for Medical AI Consultations
 * @description React component providing a real-time chat interface for medical AI conversations
 * with message rendering, file support, and interactive features
 * @author Healthcare System Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * ChatInterface component for AI medical consultations
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of chat messages with role, content, and metadata
 * @param {Function} props.onSendMessage - Callback function to send new messages
 * @param {boolean} props.loading - Loading state for message processing
 * @param {Array} props.followUpQuestions - Array of suggested follow-up questions (deprecated)
 * @returns {JSX.Element} Chat interface with message history, input field, and controls
 * @description Provides a WhatsApp-like chat interface for medical AI conversations featuring:
 * - Real-time message display with markdown support
 * - Automatic scrolling to latest messages
 * - Message type indicators (text, emergency alerts, file analysis)
 * - Timestamp formatting and user/AI message distinction
 * - Loading states and input validation
 */
const ChatInterface = ({ messages, onSendMessage, loading, followUpQuestions = [] }) => {
  // State for current message input
  const [message, setMessage] = useState('');
  
  // State for follow-up questions visibility (deprecated feature)
  const [showFollowUp, setShowFollowUp] = useState(false);
  
  // Refs for DOM manipulation and focus management
  const messagesEndRef = useRef(null);  // For auto-scroll to bottom
  const inputRef = useRef(null);        // For input focus management

  /**
   * Scroll to the bottom of the message container
   * @function scrollToBottom
   * @description Smoothly scrolls the chat container to show the latest message
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Auto-scroll to bottom when new messages arrive
   * @effect
   * @description Automatically scrolls to bottom whenever messages array changes
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle form submission for sending messages
   * @function handleSubmit
   * @param {Event} e - Form submission event
   * @description Validates input, sends message via callback, and resets form state
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send if message has content and not currently loading
    if (message.trim() && !loading) {
      onSendMessage(message.trim());
      setMessage('');                    // Clear input field
      setShowFollowUp(false);           // Hide follow-up questions
    }
  };

  /**
   * Handle clicking on suggested follow-up questions
   * @function handleFollowUpClick
   * @param {string} question - The follow-up question text
   * @description Cleans question formatting and sends it as a new message
   * @deprecated This feature has been disabled in the current version
   */
  const handleFollowUpClick = (question) => {
    // Clean the question by removing any prefixes like "1. " or "- "
    const cleanQuestion = question.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
    
    // Directly send the message instead of just setting it in input
    onSendMessage(cleanQuestion);
    setShowFollowUp(false);
  };

  /**
   * Format timestamp for message display
   * @function formatTimestamp
   * @param {string|Date} timestamp - Message timestamp
   * @returns {string} Formatted time string (HH:MM format)
   * @description Converts timestamp to user-friendly time format
   */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'emergency_alert':
        return '🚨';
      case 'file_analysis':
        return '📊';
      case 'symptom_check':
        return '🩺';
      default:
        return '';
    }
  };

  return (
    <div className="chat-interface">
      {/* Chat Messages Container */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">🩺</div>
            <h3>Medical AI Assistant</h3>
            <p>Ask me about your symptoms, upload medical reports, or get health information.</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'} ${
                  msg.messageType === 'emergency_alert' ? 'emergency-message' : ''
                }`}
              >
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.role === 'user' ? '👤 You' : '🤖 Medical AI'}
                      {getMessageIcon(msg.messageType)}
                    </span>
                    <span className="message-time">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <div className="message-text">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message ai-message">
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">🤖 Medical AI</span>
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Analyzing your message...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Follow-up Questions Removed */}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your symptoms or ask a health question..."
            className="message-input"
            rows="2"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              '📤'
            )}
          </button>
        </div>
        <div className="input-hints">
          <span>💡 Try asking: "I have a headache and fever" or upload a medical report</span>
        </div>
      </form>

      <style jsx>{`
        .chat-interface {
          display: flex;
          flex-direction: column;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(to bottom, #f8fafc, #ffffff);
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #64748b;
        }

        .empty-chat-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-chat h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          flex-direction: column;
        }

        .user-message {
          align-items: flex-end;
        }

        .ai-message {
          align-items: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .user-message .message-content {
          background: #3b82f6;
          color: white;
        }

        .ai-message .message-content {
          background: #f1f5f9;
          color: #1e293b;
        }

        .emergency-message .message-content {
          background: #fef2f2;
          border: 2px solid #ef4444;
          color: #dc2626;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .message-sender {
          font-weight: 600;
        }

        .message-time {
          font-size: 0.75rem;
        }

        .message-text {
          line-height: 1.5;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #64748b;
          border-radius: 50%;
          animation: typing 1.5s ease-in-out infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          30% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .follow-up-questions {
          padding: 16px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .follow-up-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
        }

        .toggle-follow-up {
          background: none;
          border: none;
          cursor: pointer;
          color: #3b82f6;
          font-size: 0.875rem;
        }

        .follow-up-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .follow-up-question {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .follow-up-question:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
        }

        .message-input-form {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 22px;
          resize: none;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .message-input:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: background-color 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .send-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .input-hints {
          margin-top: 8px;
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
        }

        @media (max-width: 768px) {
          .chat-interface {
            height: 500px;
          }

          .message-content {
            max-width: 90%;
          }

          .chat-messages-container {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
