import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import ChatInterface from '../components/ChatInterface.jsx';
import FileUploader from '../components/FileUploader.jsx';
import axios from 'axios';

const MedicalChatbot = () => {
  const { user, token } = useContext(AuthContext);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);

  useEffect(() => {
    if (user && token) {
      startNewSession();
      loadChatSessions();
    }
  }, [user, token]);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const startNewSession = async () => {
    try {
      const response = await api.post('/chatbot/start');
      
      setSessionId(response.data.data.sessionId);
      setMessages([{
        role: 'assistant',
        content: response.data.data.initialMessage,
        timestamp: new Date(),
        messageType: 'text'
      }]);
      setFollowUpQuestions([]);
    } catch (error) {
      console.error('Error starting chat session:', error);
      alert('Failed to start chat session. Please try again.');
    }
  };

  const loadChatSessions = async () => {
    try {
      console.log('🔍 Loading chat sessions for user...');
      console.log('🔑 User:', user?.name, 'ID:', user?._id);
      console.log('🔑 Token exists:', !!token);
      
      const response = await api.get('/chatbot/sessions?limit=5');
      console.log('📥 Chat sessions response:', response.data);
      
      const sessions = response.data.data.sessions;
      console.log('📊 Sessions loaded:', sessions.length);
      setChatSessions(sessions);
    } catch (error) {
      console.error('❌ Error loading chat sessions:', error.response?.data || error.message);
    }
  };

  const loadChatHistory = async (selectedSessionId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chatbot/history/${selectedSessionId}`);
      
      setSessionId(selectedSessionId);
      setMessages(response.data.data.messages);
      setShowSessionHistory(false);
    } catch (error) {
      console.error('Error loading chat history:', error);
      alert('Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message) => {
    if (!sessionId) {
      alert('No active session. Please start a new conversation.');
      return;
    }

    setLoading(true);
    setFollowUpQuestions([]);

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      messageType: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.post('/chatbot/message', {
        sessionId,
        message
      });

      const { response: aiResponse, messageType, followUpQuestions: newFollowUp } = response.data.data;

      // Add AI response to UI
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        messageType: messageType || 'text'
      };
      setMessages(prev => [...prev, aiMessage]);

      // Set follow-up questions
      if (newFollowUp && newFollowUp.length > 0) {
        setFollowUpQuestions(newFollowUp);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to UI
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        messageType: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!sessionId) {
      throw new Error('No active chat session. Please start a new conversation.');
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const response = await axios.post(
        'http://localhost:5000/api/v1/chatbot/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Add system message about file upload
      const uploadMessage = {
        role: 'system',
        content: `📄 Medical report uploaded: ${response.data.fileName}`,
        timestamp: new Date(),
        messageType: 'text'
      };

      // Add analysis message
      const analysisMessage = {
        role: 'assistant',
        content: `📊 **Medical Report Analysis**\n\n${response.data.analysis}`,
        timestamp: new Date(),
        messageType: 'file_analysis'
      };

      setMessages(prev => [...prev, uploadMessage, analysisMessage]);

    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload and analyze report');
    } finally {
      setUploading(false);
    }
  };

  const endCurrentSession = async () => {
    if (!sessionId) return;

    try {
      await api.patch(`/chatbot/end/${sessionId}`);
      startNewSession();
      loadChatSessions();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (!user) {
    return (
      <div className="medical-chatbot-container">
        <div className="auth-required">
          <h2>🔒 Authentication Required</h2>
          <p>Please log in to access the Medical AI Assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🤖 Medical AI Assistant</h1>
            <p>Get health insights and analyze your medical reports</p>
          </div>
          <div className="header-actions">
            <button
              className="session-history-btn"
              onClick={() => setShowSessionHistory(!showSessionHistory)}
            >
              📋 History
            </button>
            <button
              className="new-session-btn"
              onClick={startNewSession}
            >
              ➕ New Chat
            </button>
          </div>
        </div>

        {/* Session History Dropdown */}
        {showSessionHistory && (
          <div className="session-history">
            <h3>Recent Conversations</h3>
            {chatSessions.length === 0 ? (
              <p>No previous conversations</p>
            ) : (
              <div className="session-list">
                {chatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`session-item ${sessionId === session.sessionId ? 'active' : ''}`}
                    onClick={() => loadChatHistory(session.sessionId)}
                  >
                    <div className="session-title">{session.sessionTitle}</div>
                    <div className="session-meta">
                      {new Date(session.lastActivity).toLocaleDateString()} • 
                      {session.messageCount} messages
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="chatbot-content">
        {!showSessionHistory && (
          <div className="chat-section">
            <FileUploader
              onFileUpload={handleFileUpload}
              uploading={uploading}
              sessionId={sessionId}
            />
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
              followUpQuestions={followUpQuestions}
            />
            {sessionId && (
              <div className="session-actions">
                <button
                  className="end-session-btn"
                  onClick={endCurrentSession}
                >
                  🔚 End Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .medical-chatbot-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .auth-required {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .auth-required h2 {
          color: #1e293b;
          margin-bottom: 12px;
        }

        .auth-required p {
          color: #64748b;
        }

        .chatbot-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title h1 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 2rem;
        }

        .header-title p {
          margin: 0;
          color: #64748b;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .session-history-btn,
        .new-session-btn {
          padding: 10px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .session-history-btn:hover,
        .new-session-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .new-session-btn {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .new-session-btn:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .session-history {
          margin-top: 20px;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 10;
        }

        .session-history h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .session-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .session-item {
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .session-item:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .session-item.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .session-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .session-meta {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .chatbot-content {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-height: 60vh;
          position: relative;
          z-index: 1;
        }

        .chat-section {
          padding: 24px;
        }

        .session-actions {
          margin-top: 16px;
          text-align: center;
        }

        .end-session-btn {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .end-session-btn:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .medical-chatbot-container {
            padding: 12px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-title h1 {
            font-size: 1.5rem;
          }

          .header-actions {
            justify-content: center;
          }

          .tab-navigation {
            padding: 6px;
          }

          .tab-button {
            padding: 10px 12px;
            font-size: 0.875rem;
          }

          .chat-section {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalChatbot;
