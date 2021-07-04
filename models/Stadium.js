import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const stadiumSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    iframeSrc: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      lowercase: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Stadium', stadiumSchema);
