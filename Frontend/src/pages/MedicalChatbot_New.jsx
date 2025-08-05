import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import ChatInterface from '../components/ChatInterface.jsx';
import FileUploader from '../components/FileUploader.jsx';
import axios from 'axios';

const MedicalChatbot = () => {
  const { user, token } = useContext(AuthContext);
  
  // Core state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  
  // History state
  const [chatSessions, setChatSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // API setup
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Initialize on mount
  useEffect(() => {
    if (user && token) {
      startNewSession();
      loadChatSessions();
    }
  }, [user, token]);

  // Start new chat session
  const startNewSession = async () => {
    try {
      console.log('🚀 Starting new chat session...');
      const response = await api.post('/chatbot/start');
      
      setSessionId(response.data.data.sessionId);
      setMessages([{
        role: 'assistant',
        content: response.data.data.initialMessage,
        timestamp: new Date(),
        messageType: 'text'
      }]);
      setShowHistory(false);
      
      console.log('✅ New session started:', response.data.data.sessionId);
      
      // Refresh session list
      await loadChatSessions();
    } catch (error) {
      console.error('❌ Error starting chat session:', error);
      alert('Failed to start chat session. Please try again.');
    }
  };

  // Load chat sessions list
  const loadChatSessions = async () => {
    try {
      setHistoryLoading(true);
      console.log('📋 Loading chat sessions...');
      console.log('🔑 User:', user?.name, 'Token exists:', !!token);
      
      const response = await api.get('/chatbot/sessions?limit=10');
      console.log('📥 Sessions response:', response.data);
      
      if (response.data.success) {
        const sessions = response.data.data.sessions || [];
        console.log('📊 Sessions loaded:', sessions.length);
        setChatSessions(sessions);
      } else {
        console.warn('⚠️ Sessions response not successful:', response.data);
        setChatSessions([]);
      }
    } catch (error) {
      console.error('❌ Error loading chat sessions:', error.response?.data || error.message);
      setChatSessions([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load specific chat history
  const loadChatHistory = async (selectedSessionId) => {
    try {
      setLoading(true);
      console.log('📖 Loading history for session:', selectedSessionId);
      
      const response = await api.get(`/chatbot/history/${selectedSessionId}`);
      console.log('📥 History response:', response.data);
      
      if (response.data.success) {
        setSessionId(selectedSessionId);
        setMessages(response.data.data.messages || []);
        setShowHistory(false);
        console.log('✅ History loaded:', response.data.data.messages?.length, 'messages');
      } else {
        alert('Failed to load chat history.');
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      alert('Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
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

  // Handle file upload
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
        content: `📄 Medical document uploaded: ${response.data.fileName}`,
        timestamp: new Date(),
        messageType: 'text'
      };

      // Add analysis message
      const analysisMessage = {
        role: 'assistant',
        content: `📊 **Medical Document Analysis**\n\n${response.data.analysis}`,
        timestamp: new Date(),
        messageType: 'file_analysis'
      };

      setMessages(prev => [...prev, uploadMessage, analysisMessage]);

    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload and analyze document');
    } finally {
      setUploading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // If not authenticated
  if (!user || !token) {
    return (
      <div className="auth-required">
        <h2>🔐 Authentication Required</h2>
        <p>Please log in to access the Medical AI Assistant.</p>
      </div>
    );
  }

  return (
    <div className="medical-chatbot">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <h1>🤖 Medical AI Assistant</h1>
          <p>Get health insights and analyze your medical documents</p>
        </div>
        <div className="header-right">
          <button
            className={`history-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            📋 Chat History ({chatSessions.length})
          </button>
          <button
            className="new-chat-btn"
            onClick={startNewSession}
          >
            ➕ New Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="chatbot-main">
        {showHistory ? (
          /* History View */
          <div className="history-view">
            <div className="history-header">
              <h2>📋 Chat History</h2>
              <button
                className="close-history-btn"
                onClick={() => setShowHistory(false)}
              >
                ✕ Close
              </button>
            </div>
            
            {historyLoading ? (
              <div className="loading">Loading chat history...</div>
            ) : chatSessions.length === 0 ? (
              <div className="no-sessions">
                <p>🔍 No chat history found</p>
                <p>Start a new conversation to see it here!</p>
              </div>
            ) : (
              <div className="sessions-list">
                {chatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`session-card ${sessionId === session.sessionId ? 'current' : ''}`}
                    onClick={() => loadChatHistory(session.sessionId)}
                  >
                    <div className="session-title">
                      💬 {session.sessionTitle}
                    </div>
                    <div className="session-meta">
                      📅 {formatDate(session.lastActivity)} • 
                      💬 {session.messageCount} messages
                      {session.reportCount > 0 && ` • 📄 ${session.reportCount} files`}
                    </div>
                    <div className="session-preview">
                      {session.lastMessage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat View */
          <div className="chat-view">
            <div className="file-upload-section">
              <FileUploader
                onFileUpload={handleFileUpload}
                uploading={uploading}
                sessionId={sessionId}
              />
            </div>
            
            <div className="chat-section">
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                loading={loading}
                followUpQuestions={followUpQuestions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .medical-chatbot {
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chatbot-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left h1 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 2rem;
        }

        .header-left p {
          margin: 0;
          color: #64748b;
        }

        .header-right {
          display: flex;
          gap: 12px;
        }

        .history-btn,
        .new-chat-btn {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .history-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .history-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .new-chat-btn {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .new-chat-btn:hover {
          background: #059669;
          border-color: #059669;
        }

        .chatbot-main {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .history-view {
          padding: 24px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .history-header h2 {
          margin: 0;
          color: #1e293b;
        }

        .close-history-btn {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          color: #64748b;
        }

        .close-history-btn:hover {
          background: #f1f5f9;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .no-sessions {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-card {
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .session-card:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .session-card.current {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .session-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .session-meta {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 8px;
        }

        .session-preview {
          font-size: 0.875rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-view {
          padding: 24px;
        }

        .file-upload-section {
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .medical-chatbot {
            padding: 12px;
          }

          .chatbot-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-right {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalChatbot;