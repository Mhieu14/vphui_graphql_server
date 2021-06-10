import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const DiscussSchema = Schema(
  {
    title: String,
    image: String,
    imagePublicId: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Discuss', DiscussSchema);
