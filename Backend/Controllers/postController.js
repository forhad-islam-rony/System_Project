import Post from '../models/PostSchema.js';
import User from '../models/UserSchema.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, division, category, images } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!title || !content || !division || !category) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Ensure images is an array of strings and validate URLs
    let validatedImages = [];
    if (Array.isArray(images)) {
      validatedImages = images.filter(url => 
        typeof url === 'string' && 
        url.startsWith('http')
      );
    }

    // Create new post
    const newPost = new Post({
      title,
      content,
      division,
      category,
      images: validatedImages,
      user: userId,
      status: 'pending' // All new posts start as pending
    });

    // Save post
    await newPost.save();

    // Populate user information
    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'name photo');

    res.status(201).json({
      success: true,
      message: 'Post created successfully and pending moderation',
      data: populatedPost
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post
      .find({ status: 'approved' })
      .populate('user', 'name photo')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post
      .findById(req.params.id)
      .populate('user', 'name photo')
      .populate('comments.user', 'name photo');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching posts for user:', userId);

    const posts = await Post
      .find({ user: userId })
      .populate('user', 'name photo')
      .populate('comments.user', 'name photo')
      .populate('likes', 'name photo')
      .sort('-createdAt');

    console.log('Found posts:', posts.length);

    res.status(200).json({
      success: true,
      message: 'User posts fetched successfully',
      data: posts
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Ensure division is provided in updates
    if (req.body.division === '') {
      return res.status(400).json({
        success: false,
        message: 'Division is required'
      });
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        isEdited: true,
        lastEditedAt: Date.now()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Like/Unlike post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex === -1) {
      // Like post
      post.likes.push(req.userId);
    } else {
      // Unlike post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike post',
      error: error.message
    });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      user: req.userId,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user info in the new comment
    const populatedPost = await Post
      .findById(post._id)
      .populate('comments.user', 'name photo');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Remove comment
export const removeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find comment
    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment removed successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove comment',
      error: error.message
    });
  }
};

// Report post
export const reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newReport = {
      user: req.userId,
      reason: req.body.reason
    };

    post.reports.push(newReport);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to report post',
      error: error.message
    });
  }
};

// Approve post (admin only)
export const approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post approved successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve post',
      error: error.message
    });
  }
};

// Reject post (admin only)
export const rejectPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post rejected successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject post',
      error: error.message
    });
  }
}; 