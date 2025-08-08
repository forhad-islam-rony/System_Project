/**
 * @fileoverview Medical AI Chatbot Page Component
 * @description Advanced medical consultation interface with AI-powered responses,
 * medical document analysis, chat history, and emergency detection capabilities
 * @author Healthcare System Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import ChatInterface from '../components/ChatInterface.jsx';
import FileUploader from '../components/FileUploader.jsx';
import axios from 'axios';
import useScrollToTop from '../hooks/useScrollToTop';

/**
 * Medical AI Chatbot component for healthcare consultations
 * @component
 * @returns {JSX.Element} Complete medical chatbot interface
 * @description Provides an AI-powered medical consultation interface with:
 * - Real-time chat with medical AI
 * - Medical document upload and analysis
 * - Chat history management
 * - Emergency symptom detection
 * - Follow-up question suggestions
 * - Responsive design for all devices
 */
function MedicalChatbot() {
  // Get authentication context for user data and token
  const { user, token } = useContext(AuthContext);
  
  // Use custom hook for scroll to top functionality
  useScrollToTop();
  
  // ==================== State Management ====================
  
  // Core chat functionality state
  const [sessionId, setSessionId] = useState(null);       // Current chat session ID
  const [messages, setMessages] = useState([]);           // Chat message history
  const [loading, setLoading] = useState(false);          // Message sending state
  const [uploading, setUploading] = useState(false);      // File upload state
  const [followUpQuestions, setFollowUpQuestions] = useState([]); // AI suggestions
  
  // Chat history management state
  const [chatSessions, setChatSessions] = useState([]);   // All user's chat sessions
  const [showHistory, setShowHistory] = useState(false);  // History modal visibility
  const [historyLoading, setHistoryLoading] = useState(false); // History loading state

  // ==================== API Configuration ====================
  
  // Configure axios instance with authentication
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',  // Backend API URL
    headers: {
      'Authorization': `Bearer ${token}`,      // JWT authentication
      'Content-Type': 'application/json'       // Default content type
    }
  });

  // ==================== Initialization ====================
  

  
  /**
   * Initialize chatbot on component mount
   * @effect
   * @description Starts new chat session and loads history when user is authenticated
   */
  useEffect(() => {
    if (user && token) {
      startNewSession();    // Start fresh chat session
      loadChatSessions();   // Load previous chat history
    }
  }, [user, token]);

  /**
   * Start a new chat session with the AI
   * @async
   * @function startNewSession
   * @description Creates new chat session, initializes with welcome message,
   * and refreshes session list
   */
  const startNewSession = async () => {
    try {
      console.log('🚀 Starting new chat session...');
      
      // Create new session via API
      const response = await api.post('/chatbot/start');
      
      // Initialize chat state
      setSessionId(response.data.data.sessionId);
      setMessages([{
        role: 'assistant',
        content: response.data.data.initialMessage,
        timestamp: new Date(),
        messageType: 'text'
      }]);
      setShowHistory(false);  // Hide history panel
      
      console.log('✅ New session started:', response.data.data.sessionId);
      
      // Update sessions list with new session
      await loadChatSessions();
    } catch (error) {
      console.error('❌ Error starting chat session:', error);
      alert('Failed to start chat session. Please try again.');
    }
  };

  /**
   * Load user's chat session history
   * @async
   * @function loadChatSessions
   * @description Fetches recent chat sessions from backend with loading states
   * and error handling. Limits to 10 most recent sessions.
   */
  const loadChatSessions = async () => {
    try {
      // Show loading state
      setHistoryLoading(true);
      console.log('📋 Loading chat sessions...');
      console.log('🔑 User:', user?.name, 'Token exists:', !!token);
      
      // Fetch recent sessions from API
      const response = await api.get('/chatbot/sessions?limit=10');
      console.log('📥 Sessions response:', response.data);
      
      // Update state based on API response
      if (response.data.success) {
        const sessions = response.data.data.sessions || [];
        console.log('📊 Sessions loaded:', sessions.length);
        setChatSessions(sessions);  // Update sessions list
      } else {
        console.warn('⚠️ Sessions response not successful:', response.data);
        setChatSessions([]);  // Clear sessions on error
      }
    } catch (error) {
      // Handle API errors
      console.error('❌ Error loading chat sessions:', error.response?.data || error.message);
      setChatSessions([]);  // Clear sessions on error
    } finally {
      // Reset loading state
      setHistoryLoading(false);
    }
  };

  /**
   * Load chat history for a specific session
   * @async
   * @function loadChatHistory
   * @param {string} selectedSessionId - ID of the session to load
   * @description Fetches complete message history for a selected chat session
   * and updates the chat interface accordingly
   */
  const loadChatHistory = async (selectedSessionId) => {
    try {
      // Show loading state
      setLoading(true);
      console.log('📖 Loading history for session:', selectedSessionId);
      
      // Fetch session history from API
      const response = await api.get(`/chatbot/history/${selectedSessionId}`);
      console.log('📥 History response:', response.data);
      
      // Update chat interface with historical messages
      if (response.data.success) {
        setSessionId(selectedSessionId);  // Set active session
        setMessages(response.data.data.messages || []);  // Load messages
        setShowHistory(false);  // Hide history panel
        console.log('✅ History loaded:', response.data.data.messages?.length, 'messages');
      } else {
        alert('Failed to load chat history.');
      }
    } catch (error) {
      // Handle API errors
      console.error('❌ Error loading chat history:', error);
      alert('Failed to load chat history.');
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  /**
   * Delete a chat session
   * @async
   * @function deleteChatSession
   * @param {string} sessionIdToDelete - ID of the session to delete
   * @param {Event} event - Click event to prevent propagation
   * @description Deletes a chat session after user confirmation
   */
  const deleteChatSession = async (sessionIdToDelete, event) => {
    // Prevent triggering loadChatHistory when clicking delete button
    event.stopPropagation();
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this chat? This action cannot be undone.');
    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting chat session:', sessionIdToDelete);
      
      // Send delete request to API
      const response = await api.delete(`/chatbot/session/${sessionIdToDelete}`);
      
      if (response.data.success) {
        console.log('✅ Chat session deleted successfully');
        
        // If the deleted session is the current active session, start a new one
        if (sessionIdToDelete === sessionId) {
          await startNewSession();
        }
        
        // Refresh the chat sessions list
        await loadChatSessions();
        
        // Show success message (optional)
        alert('Chat deleted successfully!');
      } else {
        alert('Failed to delete chat session.');
      }
    } catch (error) {
      console.error('❌ Error deleting chat session:', error);
      alert('Failed to delete chat session. Please try again.');
    }
  };

  /**
   * Send user message to AI and handle response
   * @async
   * @function sendMessage
   * @param {string} message - User's message text
   * @description Sends message to AI, handles response, and updates chat interface
   * with proper error handling and loading states
   */
  const sendMessage = async (message) => {
    // Validate active session
    if (!sessionId) {
      alert('No active session. Please start a new conversation.');
      return;
    }

    // Initialize message sending state
    setLoading(true);
    setFollowUpQuestions([]);  // Clear previous suggestions

    // Immediately add user message for responsive UI
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      messageType: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message to AI via API
      const response = await api.post('/chatbot/message', {
        sessionId,
        message
      });

      // Extract AI response data
      const { 
        response: aiResponse,        // AI's message content
        messageType,                 // Message type (text/emergency/analysis)
        followUpQuestions: newFollowUp  // Suggested follow-up questions
      } = response.data.data;

      // Add AI response to chat interface
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        messageType: messageType || 'text'  // Default to text type
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update follow-up suggestions if provided
      if (newFollowUp && newFollowUp.length > 0) {
        setFollowUpQuestions(newFollowUp);
      }

    } catch (error) {
      // Handle API errors gracefully
      console.error('Error sending message:', error);
      
      // Show error message in chat interface
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        messageType: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  /**
   * Handle medical document upload and analysis
   * @async
   * @function handleFileUpload
   * @param {File} file - Medical document file to upload
   * @throws {Error} If no active session or upload fails
   * @description Uploads medical documents (PDFs, images) for AI analysis
   * and adds results to chat interface
   */
  const handleFileUpload = async (file) => {
    // Validate active session
    if (!sessionId) {
      throw new Error('No active chat session. Please start a new conversation.');
    }

    // Show upload progress state
    setUploading(true);

    try {
      // Prepare file upload data
      const formData = new FormData();
      formData.append('file', file);         // Medical document
      formData.append('sessionId', sessionId); // Current session

      // Upload file to backend for analysis
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

      // Add upload confirmation message
      const uploadMessage = {
        role: 'system',
        content: `📄 Medical document uploaded: ${response.data.fileName}`,
        timestamp: new Date(),
        messageType: 'text'
      };

      // Add AI analysis results
      const analysisMessage = {
        role: 'assistant',
        content: `📊 **Medical Document Analysis**\n\n${response.data.analysis}`,
        timestamp: new Date(),
        messageType: 'file_analysis'  // Special type for document analysis
      };

      // Update chat with upload and analysis messages
      setMessages(prev => [...prev, uploadMessage, analysisMessage]);

    } catch (error) {
      // Handle upload/analysis errors
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload and analyze document');
    } finally {
      // Reset upload state
      setUploading(false);
    }
  };

  /**
   * Format date for user-friendly display
   * @function formatDate
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string (Today, Yesterday, or local date)
   * @description Converts timestamps to relative dates for better readability
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);  // Calculate yesterday

    // Return relative or absolute date based on timestamp
    if (date.toDateString() === today.toDateString()) {
      return 'Today';  // Message from today
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';  // Message from yesterday
    } else {
      return date.toLocaleDateString();  // Older messages show full date
    }
  };

  // ==================== Authentication Check ====================
  
  /**
   * Render authentication gate
   * @returns {JSX.Element} Authentication required message
   */
  if (!user || !token) {
    return (
      <div className="auth-required">
        <h2>🔐 Authentication Required</h2>
        <p>Please log in to access the Medical AI Assistant.</p>
      </div>
    );
  }

  // ==================== Main Chatbot Interface ====================
  
  return (
    <div className="medical-chatbot">
      {/* ========== Header Section ========== */}
      <div className="chatbot-header">
        {/* Title and Description */}
        <div className="header-left">
          <h1>🤖 Medical AI Assistant</h1>
          <p>Get health insights and analyze your medical documents</p>
        </div>
        
        {/* Control Buttons */}
        <div className="header-right">
          {/* Chat History Toggle Button */}
          <button
            className={`history-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            📋 Chat History ({chatSessions.length})
          </button>
          
          {/* New Chat Button */}
          <button
            className="new-chat-btn"
            onClick={startNewSession}
          >
            ➕ New Chat
          </button>
        </div>
      </div>

      {/* ========== Main Content Area ========== */}
      <div className="chatbot-main">
        {showHistory ? (
          /* ========== Chat History View ========== */
          <div className="history-view">
            {/* History Panel Header */}
            <div className="history-header">
              <h2>📋 Chat History</h2>
              <button
                className="close-history-btn"
                onClick={() => setShowHistory(false)}
              >
                ✕ Close
              </button>
            </div>
            
            {/* History Content with Loading States */}
            {historyLoading ? (
              <div className="loading">Loading chat history...</div>
            ) : chatSessions.length === 0 ? (
              <div className="no-sessions">
                <p>🔍 No chat history found</p>
                <p>Start a new conversation to see it here!</p>
              </div>
            ) : (
              /* Session Cards List */
              <div className="sessions-list">
                {chatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`session-card ${sessionId === session.sessionId ? 'current' : ''}`}
                    onClick={() => loadChatHistory(session.sessionId)}
                  >
                    {/* Session Header with Title and Delete Button */}
                    <div className="session-header">
                      <div className="session-title">
                        💬 {session.sessionTitle}
                      </div>
                      <button
                        className="delete-session-btn"
                        onClick={(e) => deleteChatSession(session.sessionId, e)}
                        title="Delete this chat"
                      >
                        🗑️
                      </button>
                    </div>
                    {/* Session Metadata */}
                    <div className="session-meta">
                      📅 {formatDate(session.lastActivity)} • 
                      💬 {session.messageCount} messages
                      {session.reportCount > 0 && ` • 📄 ${session.reportCount} files`}
                    </div>
                    {/* Last Message Preview */}
                    <div className="session-preview">
                      {session.lastMessage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ========== Active Chat View ========== */
          <div className="chat-view">
            {/* File Upload Component */}
            <div className="file-upload-section">
              <FileUploader
                onFileUpload={handleFileUpload}
                uploading={uploading}
                sessionId={sessionId}
              />
            </div>
            
            {/* Chat Interface Component */}
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

      {/* ========== Component Styles ========== */}
      <style jsx>{`
        /* Main Container */
        .medical-chatbot {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Authentication Gate */
        .auth-required {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Header Styles */
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

        /* Control Buttons */
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

        /* History Button States */
        .history-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .history-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        /* New Chat Button States */
        .new-chat-btn {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .new-chat-btn:hover {
          background: #059669;
          border-color: #059669;
        }

        /* Main Content Area */
        .chatbot-main {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* History Panel */
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

        /* Close History Button */
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

        /* Loading States */
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

        /* Session History List */
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Session Card */
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

        /* Session Card Content */
        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .session-title {
          font-weight: 600;
          color: #1e293b;
          flex: 1;
          margin-right: 12px;
        }

        /* Delete Button */
        .delete-session-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 16px;
          opacity: 0.6;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .delete-session-btn:hover {
          opacity: 1;
          background: #fee2e2;
          color: #dc2626;
          transform: scale(1.1);
        }

        .delete-session-btn:active {
          transform: scale(0.95);
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

        /* Chat View */
        .chat-view {
          padding: 24px;
        }

        .file-upload-section {
          margin-bottom: 24px;
        }

        /* Responsive Design */
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

export { MedicalChatbot as default };
