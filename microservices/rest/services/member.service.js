import mongoose from 'mongoose';
import Models from '../../../models/index';
import MemberRole from '../constants/memberrole.constant';

export default {
  addMember: async (teamId, userId) => {
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      let newMember = null;
      await session.withTransaction(async () => {
        const opts = { session };
        newMember = await new Models.Member({
          user: userId,
          team: teamId,
          role: MemberRole.MEMBER
        }).save();
  
        await Models.Team.findOneAndUpdate({ _id: teamId }, { $push: { members: newMember.id } });
        await Models.User.findOneAndUpdate({ _id: userId }, { $push: { memberTeams: newMember.id } });
      });
      session.endSession();
      return newMember;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },

  getTeamsUser: async (userId) => {
    try {
      return Models.User.findOne({_id: userId })
      .populate({
        path: 'memberTeams',
        populate: [
          {
            path: 'team',
            // populate: [{ path: 'author' }, { path: 'follow' }, { path: 'like' }, { path: 'comment' }],
          },
        ],
      })
      .sort({ createdAt: 'desc' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  removeMember: async (teamId, userId, memberId) => {
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      let removedMember = null
      await session.withTransaction(async () => {
        const opts = { session };
        removedMember = await Models.Member.findByIdAndRemove(memberId);
        // Delete comment from users collection
        await Models.User.findOneAndUpdate({ _id: userId }, { $pull: { memberTeams: memberId } });
        // Delete comment from posts collection
        await Models.Team.findOneAndUpdate({ _id: teamId }, { $pull: { members: memberId } });
      });
      session.endSession();
      return removedMember;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },
}