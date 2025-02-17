import Moderator from '../models/ModeratorSchema.js';
import Post from '../models/PostSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Moderator login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find moderator by email
    const moderator = await Moderator.findOne({ email });
    if (!moderator) {
      return res.status(404).json({
        success: false,
        message: 'Moderator not found'
      });
    }

    // Check if moderator is active
    if (!moderator.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, moderator.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    moderator.lastLogin = new Date();
    await moderator.save();

    console.log('Moderator Division:', moderator.division); // Debug log

    // Generate token
    const token = jwt.sign(
      { 
        id: moderator._id, 
        role: 'moderator',
        division: moderator.division // Make sure division is included
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully logged in',
      token,
      data: {
        _id: moderator._id,
        name: moderator.name,
        email: moderator.email,
        division: moderator.division,
        role: 'moderator'
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

// Get pending posts for moderator's division
export const getPendingPosts = async (req, res) => {
  try {
    const moderatorDivision = req.division;

    if (!moderatorDivision) {
      return res.status(400).json({
        success: false,
        message: 'Moderator division not found in token'
      });
    }

    console.log('Looking for posts in division:', moderatorDivision);

    // Find all posts from this division
    const posts = await Post.find({
      division: moderatorDivision,
      status: 'pending'
    })
    .populate('user', 'name photo')
    .sort('-createdAt');

    console.log('Found posts:', posts);

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: posts
    });

  } catch (error) {
    console.error('Error in getPendingPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Approve post
export const approvePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const moderatorId = req.userId;
    const moderatorDivision = req.division;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.division !== moderatorDivision) {
      return res.status(403).json({
        success: false,
        message: 'You can only moderate posts from your division'
      });
    }

    post.status = 'approved';
    post.moderatedBy = moderatorId;
    post.moderatedAt = new Date();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post approved successfully'
    });
  } catch (error) {
    console.error('Error in approvePost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve post'
    });
  }
};

// Reject post
export const rejectPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const moderatorId = req.userId;
    const moderatorDivision = req.division;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.division !== moderatorDivision) {
      return res.status(403).json({
        success: false,
        message: 'You can only moderate posts from your division'
      });
    }

    post.status = 'rejected';
    post.rejectionReason = reason;
    post.moderatedBy = moderatorId;
    post.moderatedAt = new Date();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post rejected successfully'
    });
  } catch (error) {
    console.error('Error in rejectPost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject post'
    });
  }
};

// Get moderator stats for their division
export const getStats = async (req, res) => {
  try {
    const moderatorDivision = req.division;

    // Get total posts count by status for moderator's division
    const stats = await Post.aggregate([
      {
        $match: { 
          division: moderatorDivision
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// Get recent posts for moderator's division
export const getRecentPosts = async (req, res) => {
  try {
    const moderatorDivision = req.division;

    // Fetch recent posts from moderator's division
    const posts = await Post
      .find({ 
        division: moderatorDivision,
        status: { $in: ['approved', 'rejected'] },
        moderatedBy: req.userId
      })
      .sort('-updatedAt')
      .limit(10)
      .select('title category status createdAt user')
      .populate('user', 'name photo');

    res.status(200).json({
      success: true,
      message: 'Recent posts fetched successfully',
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent posts',
      error: error.message
    });
  }
}; 