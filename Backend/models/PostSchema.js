import mongoose from "mongoose";

/**
 * @fileoverview Post Schema for healthcare community posts with moderation system
 * @description Defines the database schema for user-generated healthcare posts including
 * medical experiences, doctor reviews, and treatment discussions with division-based moderation
 * @author Healthcare System Team
 * @version 1.0.0
 */

/**
 * MongoDB Schema for healthcare community posts
 * @typedef {Object} PostSchema
 * @property {ObjectId} user - Reference to the user who created the post (required)
 * @property {string} title - Post title (required)
 * @property {string} content - Post content/body (required)
 * @property {string[]} images - Array of image URLs with HTTP validation
 * @property {string} division - Geographic division for content moderation (required)
 * @property {string} category - Post category type (required)
 * @property {string} status - Moderation status: pending/approved/rejected
 * @property {ObjectId} moderatedBy - Reference to moderator who processed the post
 * @property {Date} moderatedAt - Timestamp when post was moderated
 * @property {string} rejectionReason - Reason for post rejection
 * @property {ObjectId[]} likes - Array of user IDs who liked the post
 * @property {Object[]} comments - Array of comment objects with user references
 * @property {Object[]} reports - Array of user reports against the post
 * @property {number} views - Number of times post has been viewed
 * @property {boolean} isEdited - Flag indicating if post has been edited
 * @property {Date} lastEditedAt - Timestamp of last edit
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 */
const PostSchema = new mongoose.Schema({
  /** Reference to the user who created this post */
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  /** Post title - brief description of the healthcare topic */
  title: {
    type: String,
    required: true
  },
  /** Main content/body of the post with healthcare experience or information */
  content: {
    type: String,
    required: true
  },
  /** Array of image URLs for medical photos, documents, or illustrations */
  images: {
    type: [String],
    validate: {
      // Validator function to ensure all URLs are valid HTTP/HTTPS links
      validator: function(v) {
        return Array.isArray(v) && v.every(url => 
          typeof url === 'string' && url.startsWith('http')
        );
      },
      message: props => `${props.value} is not a valid array of image URLs`
    },
    default: []
  },
  /** Geographic division for region-specific moderation and content filtering */
  division: {
    type: String,
    required: true,
    enum: [
      'Dhaka',        // Capital division
      'Chittagong',   // Major port city division
      'Rajshahi',     // Northern division
      'Khulna',       // Southwestern division
      'Barisal',      // Southern division
      'Sylhet',       // Northeastern division
      'Rangpur',      // Northern division
      'Mymensingh'    // Central-northern division
    ]
  },
  /** Category of healthcare post for proper classification and filtering */
  category: {
    type: String,
    required: true,
    enum: [
      'Medical Experience',         // Personal healthcare experiences
      'Doctor Review',             // Doctor and clinic reviews
      'Treatment Issue',           // Treatment-related problems
      'Healthcare Facility Review', // Hospital/clinic facility reviews
      'Medical Advice',            // Seeking or sharing medical advice
      'Emergency Service Experience', // Ambulance/emergency service feedback
      'Others'                     // Miscellaneous healthcare topics
    ]
  },
  /** Moderation status for content approval workflow */
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Moderation states
    default: 'pending' // All new posts start as pending moderation
  },
  /** Reference to the moderator who reviewed this post */
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moderator'
  },
  /** Timestamp when the post was moderated */
  moderatedAt: {
    type: Date
  },
  /** Reason provided by moderator if post was rejected */
  rejectionReason: {
    type: String
  },
  /** Array of user IDs who liked/upvoted this post */
  likes: [{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }],
  /** Array of comments made on this post */
  comments: [{
    /** Reference to user who made the comment */
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    /** Comment text content */
    text: {
      type: String,
      required: true
    },
    /** When the comment was created */
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  /** Array of reports filed against this post by users */
  reports: [{
    /** User who filed the report */
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    /** Reason for reporting this post */
    reason: {
      type: String,
      required: true
    },
    /** When the report was filed */
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  /** Number of times this post has been viewed */
  views: {
    type: Number,
    default: 0
  },
  /** Flag indicating if the post has been edited after creation */
  isEdited: {
    type: Boolean,
    default: false
  },
  /** Timestamp of the last edit made to this post */
  lastEditedAt: {
    type: Date
  }
}, {
  timestamps: true
});

/**
 * Database indexes for optimized query performance
 * These indexes improve the speed of common queries on the posts collection
 */

// Compound index for user's posts sorted by creation date (most recent first)
PostSchema.index({ user: 1, createdAt: -1 });

// Index for filtering posts by geographic division
PostSchema.index({ division: 1 });

// Index for filtering posts by category type
PostSchema.index({ category: 1 });

// Index for filtering posts by moderation status
PostSchema.index({ status: 1 });

// Text search index for full-text search on title and content
// Title has higher weight (2x) than content for relevance scoring
PostSchema.index({ 
  title: 'text', 
  content: 'text' 
}, {
  weights: {
    title: 2,    // Title matches are twice as important
    content: 1   // Content matches have normal weight
  }
});

/**
 * Export the Post model for use in controllers and services
 * @type {mongoose.Model<PostSchema>}
 */
export default mongoose.model("Post", PostSchema); 