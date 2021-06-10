import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    }, 
    role: {
      type: String,
      lowercase: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Member', memberSchema);
