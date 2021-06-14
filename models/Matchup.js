import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const matchupSchema = new Schema(
  {
    description: String,
    teamCreate: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    userCreate: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    stadium: {
      type: Schema.Types.ObjectId,
      ref: 'Stadium'
    },
    timeStart: {
      type: Date,
    },
    status: {
      type: String,
      lowercase: true,
      trim: true,
    },
    attentions: [{
      type: Schema.Types.ObjectId,
      ref: 'AttentionMatchup'
    }]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Matchups', matchupSchema);
