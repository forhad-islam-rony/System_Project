import express from 'express';
import multer from 'multer';
import ChatbotController from '../Controllers/chatbotController.js';
import enhancedFileUploadService from '../services/enhancedFileUploadService.js';
import { authenticate } from '../auth/verifyToken.js';

const router = express.Router();

// Configure multer upload with enhanced service
const upload = enhancedFileUploadService.getMulterConfig();

// Middleware for all chatbot routes
router.use(authenticate);

// Chat session management
router.post('/start', ChatbotController.startChatSession);
router.get('/sessions', ChatbotController.getUserChatSessions);
router.get('/history/:sessionId', ChatbotController.getChatHistory);
router.patch('/end/:sessionId', ChatbotController.endChatSession);

// Messaging
router.post('/message', ChatbotController.sendMessage);

// File upload and analysis
router.post('/upload', upload.single('file'), ChatbotController.uploadMedicalReport);

// Delete chat session
router.delete('/session/:sessionId', ChatbotController.deleteChatSession);

// Quick symptom check (standalone)
router.post('/symptom-check', ChatbotController.quickSymptomCheck);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 15MB.',
        error: 'FILE_TOO_LARGE'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.',
        error: 'TOO_MANY_FILES'
      });
    }
  } else if (error.message.includes('Invalid file type')) {
          return res.status(400).json({
        success: false,
        message: 'Invalid file type. Supported formats: PDF, Word documents, text files, and images (JPG, PNG, GIF, BMP, TIFF, WebP).',
        error: 'INVALID_FILE_TYPE'
      });
  }
  
  return res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
});

export default router;
