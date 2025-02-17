import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(url => 
          typeof url === 'string' && url.startsWith('http')
        );
      },
      message: props => `${props.value} is not a valid array of image URLs`
    },
    default: []
  },
  division: {
    type: String,
    required: true,
    enum: [
      'Dhaka',
      'Chittagong',
      'Rajshahi',
      'Khulna',
      'Barisal',
      'Sylhet',
      'Rangpur',
      'Mymensingh'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Medical Experience',
      'Doctor Review',
      'Treatment Issue',
      'Healthcare Facility Review',
      'Medical Advice',
      'Emergency Service Experience',
      'Others'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moderator'
  },
  moderatedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  likes: [{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    reason: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEditedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ division: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ 
  title: 'text', 
  content: 'text' 
}, {
  weights: {
    title: 2,
    content: 1
  }
});

export default mongoose.model("Post", PostSchema); 