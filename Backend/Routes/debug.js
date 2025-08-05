import express from 'express';
import ChatSession from '../models/ChatSession.js';
import mongoose from 'mongoose';

const router = express.Router();

// Debug route to check database contents
router.get('/db-status', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Database status check...');
    
    // Connection info
    const connectionInfo = {
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    };
    
    // Count all sessions
    const totalSessions = await ChatSession.countDocuments();
    
    // Get recent sessions
    const recentSessions = await ChatSession.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId sessionTitle createdAt messages.length isActive');
    
    // Group sessions by user
    const userGroups = await ChatSession.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const response = {
      success: true,
      data: {
        connection: connectionInfo,
        stats: {
          totalSessions,
          totalUsers: userGroups.length
        },
        recentSessions: recentSessions.map(session => ({
          id: session._id,
          userId: session.userId,
          title: session.sessionTitle,
          createdAt: session.createdAt,
          messageCount: session.messages?.length || 0,
          isActive: session.isActive
        })),
        userGroups: userGroups.slice(0, 5)
      }
    };
    
    console.log('📊 Database status:', response.data.stats);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Debug route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route for specific user
router.get('/user-sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 DEBUG: Getting sessions for user:', userId);
    
    // Try both string and ObjectId queries
    const stringQuery = await ChatSession.find({ userId: userId }).countDocuments();
    const objectIdQuery = await ChatSession.find({ userId: new mongoose.Types.ObjectId(userId) }).countDocuments();
    
    const userSessions = await ChatSession.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ lastActivity: -1 })
      .select('sessionTitle createdAt lastActivity messages uploadedReports isActive');
    
    res.json({
      success: true,
      data: {
        userId,
        stringQueryCount: stringQuery,
        objectIdQueryCount: objectIdQuery,
        sessions: userSessions.map(session => ({
          id: session._id,
          title: session.sessionTitle,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          messageCount: session.messages?.length || 0,
          reportCount: session.uploadedReports?.length || 0,
          isActive: session.isActive
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ User sessions debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;