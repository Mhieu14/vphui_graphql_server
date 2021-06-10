import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const teamSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    teamname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    elo: Number,
    image: String,
    imagePublicId: String,
    coverImage: String,
    coverImagePublicId: String,
    // posts: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Post',
    //   },
    // ],
    // followers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Follow',
    //   },
    // ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Member',
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Team', teamSchema);