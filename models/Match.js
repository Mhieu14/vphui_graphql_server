import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const matchSchema = new Schema(
  {
    teamA: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    teamB: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    teamAGoalUpdateByA: Number,
    teamBGoalUpdateByB: Number,
    teamAGoalUpdateByB: Number,
    teamBGoalUpdateByB: Number,
    matchup: {
      type: Schema.Types.ObjectId,
      ref: 'Matchup'
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Match', matchSchema);
