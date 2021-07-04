import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const attentionMatchupSchema = new Schema(
  {
    teamCreate: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    userCreate: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    matchup: {
      type: Schema.Types.ObjectId,
      ref: 'Matchup'
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AttentionMatchup', attentionMatchupSchema);
