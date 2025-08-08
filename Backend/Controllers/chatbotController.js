/**
 * @fileoverview Medical Chatbot Controller for AI-powered healthcare consultations
 * @description Handles chat sessions, medical queries, file uploads, and emergency detection
 * using Gemini AI with RAG (Retrieval-Augmented Generation) for contextual responses
 * @author Healthcare System Team
 * @version 2.0.0
 */

import ChatSession from '../models/ChatSession.js';
import geminiService from '../services/geminiService.js';
import ragService from '../services/ragService.js';
import enhancedFileUploadService from '../services/enhancedFileUploadService.js';
import mongoose from 'mongoose';

/**
 * Controller class for managing medical chatbot interactions
 * Provides AI-powered medical consultations with file analysis capabilities
 * and emergency symptom detection
 */
class ChatbotController {
  /**
   * Start a new medical consultation chat session
   * @async
   * @function startChatSession
   * @param {Object} req - Express request object containing authenticated user ID
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} JSON response with session ID and initial message
   * @description Creates a new chat session for the authenticated user with a welcome message
   * from the medical AI assistant. Each session is tied to a specific user and includes
   * an initial greeting explaining the AI's capabilities.
   */
  async startChatSession(req, res) {
    try {
      // Extract authenticated user ID from middleware
      const userId = req.userId;
      
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed - no user ID'
        });
      }
      
      // Create new chat session with initial AI greeting
      const chatSession = new ChatSession({
        userId: new mongoose.Types.ObjectId(userId),
        sessionTitle: `Medical Consultation - ${new Date().toLocaleDateString()}`,
        messages: [{
          role: 'assistant',
          content: 'Hello! I\'m your medical AI assistant. I can help you understand symptoms, analyze medical reports, and provide health information. How can I assist you today?',
          timestamp: new Date(),
          messageType: 'text'
        }],
        isActive: true
      });
      
      // Save session to database
      const savedSession = await chatSession.save();
      
      // Return success response with session details
      res.status(200).json({
        success: true,
        data: {
          sessionId: chatSession._id,
          message: 'Chat session started successfully',
          initialMessage: chatSession.messages[0].content
        }
      });
    } catch (error) {
      // Log error and return failure response
      console.error('Error starting chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start chat session',
        error: error.message
      });
    }
  }

  // Send message in chat
  async sendMessage(req, res) {
    try {
      const { sessionId, message } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed - no user ID'
        });
      }

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and message are required'
        });
      }

      // Find chat session
      const session = await ChatSession.findOne({ 
        _id: sessionId, 
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true 
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found or inactive'
        });
      }

      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        messageType: 'text'
      });

      // Check for emergency symptoms
      const emergencyCheck = await geminiService.checkEmergencySymptoms(message);
      const isEmergency = emergencyCheck.includes('EMERGENCY_LEVEL: HIGH');

      // Find relevant medical context using RAG
      const relevantContext = await ragService.findRelevantContext(message);
      const contextText = relevantContext.map(ctx => ctx.content).join('\n');

      // Get recent report analysis if available
      const recentReport = session.uploadedReports
        .filter(report => report.analysisStatus === 'completed')
        .sort((a, b) => b.uploadedAt - a.uploadedAt)[0];

      const reportAnalysis = recentReport ? recentReport.extractedText.substring(0, 1000) : '';

      // Generate AI response
      const conversationHistory = session.messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let aiResponse;
      if (isEmergency) {
        aiResponse = `🚨 **URGENT MEDICAL ATTENTION NEEDED** 🚨\n\nBased on your symptoms, this could be a medical emergency. Please:\n\n1. Call emergency services immediately (999 in Bangladesh)\n2. Go to the nearest emergency department\n3. If possible, have someone accompany you\n\nDo not wait - seek immediate medical attention.\n\n${emergencyCheck}`;
      } else {
        aiResponse = await geminiService.generateMedicalResponse(
          conversationHistory,
          contextText,
          reportAnalysis
        );
      }

      // Add AI response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        messageType: isEmergency ? 'emergency_alert' : 'text'
      });

      // Save session
      await session.save();

      res.status(200).json({
        success: true,
        data: {
          response: aiResponse,
          messageType: isEmergency ? 'emergency_alert' : 'text',
          isEmergency,
          contextFound: relevantContext.length > 0,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error.message
      });
    }
  }

  // Upload and analyze medical report
  async uploadMedicalReport(req, res) {
    try {
      const { sessionId } = req.body;
      const file = req.file;
      const userId = req.userId;
      
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }
      
      // Use the Enhanced FileUploadService to process the file and extract text
      const fileResult = await enhancedFileUploadService.processFileUpload(file, userId, sessionId);
      
      if (!fileResult.extractedText) {
        return res.status(400).json({
          success: false,
          error: 'Failed to process the uploaded file'
        });
      }
      
      // Create a detailed analysis prompt with the extracted text
      const isPlaceholder = fileResult.extractedText.includes('[PDF Document uploaded:') || 
                           fileResult.extractedText.includes('[DOCX file uploaded:') ||
                           fileResult.extractedText.includes('[DOC file uploaded:');
      
      let analysisPrompt;
      
      if (isPlaceholder) {
        // Handle placeholder text (when we can't extract content)
        analysisPrompt = `A medical report has been uploaded: ${fileResult.originalName} (${Math.round(fileResult.fileSize / 1024)}KB).

${fileResult.extractedText}

Since I cannot directly read the content of this document, please provide the key details from your medical report such as:
- Test results and values
- Symptoms or concerns mentioned
- Doctor's notes or recommendations
- Any abnormal findings

Once you share these details, I can help provide insights and explanations about your medical information.`;
      } else {
        // Handle actual extracted text
        analysisPrompt = `Please analyze this medical report and provide insights:

DOCUMENT: ${fileResult.originalName}
FILE SIZE: ${Math.round(fileResult.fileSize / 1024)}KB

EXTRACTED CONTENT:
${fileResult.extractedText}

Please provide:
1. A summary of the key findings
2. Explanation of any abnormal values (if present)
3. General health insights
4. Recommendations for follow-up (always emphasize consulting healthcare professionals)

Format your response clearly and include relevant medical context.`;
      }
      
      // Generate AI analysis using the extracted text
      const analysis = await geminiService.generateMedicalResponse([
        {
          role: 'user',
          content: analysisPrompt
        }
      ]);
      
      // Update chat session with both the file upload notification and analysis
      const session = await ChatSession.findById(sessionId);
      if (session) {
        // Add file upload notification
        session.messages.push({
          role: 'system',
          content: `📄 Medical report uploaded: ${fileResult.originalName} (${Math.round(fileResult.fileSize / 1024)}KB)`,
          timestamp: new Date()
        });
        
        // Add AI analysis
        session.messages.push({
          role: 'assistant',
          content: analysis,
          timestamp: new Date()
        });
        
        // Store file metadata
        if (!session.uploadedReports) {
          session.uploadedReports = [];
        }
        session.uploadedReports.push({
          fileName: fileResult.fileName,
          originalName: fileResult.originalName,
          filePath: fileResult.filePath,
          fileSize: fileResult.fileSize,
          mimeType: fileResult.mimeType,
          extractedText: fileResult.extractedText,
          uploadedAt: new Date(),
          analysisStatus: 'completed'
        });
        
        await session.save();
      }
      
      res.json({
        success: true,
        analysis,
        fileName: fileResult.originalName,
        extractedTextLength: fileResult.extractedText.length,
        message: 'Medical report uploaded and analyzed successfully'
      });
      
    } catch (error) {
      console.error('Error in uploadMedicalReport:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to process medical report'
      });
    }
  }

  // Get chat history
  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      const session = await ChatSession.findOne({ 
        _id: sessionId, 
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          sessionId: session._id,
          sessionTitle: session.sessionTitle,
          messages: session.messages,
          uploadedReports: session.uploadedReports.map(report => ({
            fileName: report.originalName,
            uploadedAt: report.uploadedAt,
            analysisStatus: report.analysisStatus
          })),
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          isActive: session.isActive
        }
      });

    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat history',
        error: error.message
      });
    }
  }

  // Get user's chat sessions
  async getUserChatSessions(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10, active } = req.query;

      const query = { userId: new mongoose.Types.ObjectId(userId) };
      if (active !== undefined) {
        query.isActive = active === 'true';
      }

      const sessions = await ChatSession.find(query)
        .select('sessionTitle createdAt lastActivity isActive messages uploadedReports')
        .sort({ lastActivity: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalSessions = await ChatSession.countDocuments(query);

      const sessionsWithStats = sessions.map(session => ({
        sessionId: session._id,
        sessionTitle: session.sessionTitle,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        messageCount: session.messages.length,
        reportCount: session.uploadedReports.length,
        lastMessage: session.messages.length > 0 ? 
          session.messages[session.messages.length - 1].content.substring(0, 100) + '...' : 
          'No messages'
      }));

      res.status(200).json({
        success: true,
        data: {
          sessions: sessionsWithStats,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalSessions / limit),
            totalSessions,
            hasNext: page < Math.ceil(totalSessions / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat sessions',
        error: error.message
      });
    }
  }

  // End chat session
  async endChatSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId: new mongoose.Types.ObjectId(userId) },
        { isActive: false, lastActivity: new Date() },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Chat session ended successfully',
        data: {
          sessionId: session._id,
          isActive: session.isActive
        }
      });

    } catch (error) {
      console.error('Error ending chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end chat session',
        error: error.message
      });
    }
  }

  // Quick symptom check
  async quickSymptomCheck(req, res) {
    try {
      const { symptoms } = req.body;
      const userId = req.userId;

      if (!symptoms) {
        return res.status(400).json({
          success: false,
          message: 'Symptoms description is required'
        });
      }

      // Check emergency symptoms
      const emergencyCheck = await geminiService.checkEmergencySymptoms(symptoms);
      const isEmergency = emergencyCheck.includes('EMERGENCY_LEVEL: HIGH');

      // Get RAG context
      const relevantContext = await ragService.findRelevantContext(symptoms);
      const contextText = relevantContext.map(ctx => ctx.content).join('\n');

      // Assess symptom severity
      const severity = ragService.assessSymptomSeverity(symptoms);

      // Generate quick assessment
      let assessment;
      if (isEmergency) {
        assessment = `🚨 **URGENT MEDICAL ATTENTION NEEDED** 🚨\n\nBased on your symptoms, this could be a medical emergency. Please seek immediate medical attention.\n\n${emergencyCheck}`;
      } else {
        assessment = await geminiService.generateMedicalResponse(
          [{ role: 'user', content: `Quick symptom check: ${symptoms}` }],
          contextText
        );
      }

      res.status(200).json({
        success: true,
        data: {
          assessment,
          severity,
          isEmergency,
          relevantConditions: relevantContext.map(ctx => ({
            topic: ctx.topic,
            similarity: ctx.similarity
          })),
          recommendations: isEmergency ? 
            ['Seek immediate emergency care', 'Call 999', 'Go to nearest hospital'] :
            ['Consult with a healthcare provider', 'Monitor symptoms', 'Consider booking an appointment']
        }
      });

    } catch (error) {
      console.error('Error in quick symptom check:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform symptom check',
        error: error.message
      });
    }
  }

  // Delete chat session
  async deleteChatSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      const session = await ChatSession.findOneAndDelete({
        _id: sessionId,
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Chat session deleted successfully',
        data: {
          deletedSessionId: sessionId,
          sessionTitle: session.sessionTitle
        }
      });

    } catch (error) {
      console.error('❌ Error deleting chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chat session',
        error: error.message
      });
    }
  }
}

export default new ChatbotController();