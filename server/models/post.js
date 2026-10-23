
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Post slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 220,
    },

    excerpt: {
      type: String,
      required: [true, "Post excerpt is required"],
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      minlength: 1,
    },

    coverImage: {
      url: {
        type: String,
        trim: true,
        default: null,
      },

      publicId: {
        type: String,
        trim: true,
        default: null,
      },

     
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    readingTime: {
      type: Number,
      min: 1,
      default: 1,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
