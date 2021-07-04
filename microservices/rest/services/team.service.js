import mongoose from 'mongoose';
import Models from '../../../models/index';
import MemberRole from '../constants/memberrole.constant';

export default {
  createTeam: async (data, user) => {
    const fullname = data.fullname;
    const elo = data.elo;
    const teamname = data.teamname;
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      const newTeamId = mongoose.Types.ObjectId();
      const newMemberId = mongoose.Types.ObjectId();
      let newTeam = null;
      await session.withTransaction(async () => {
        const opts = { session };
        newTeam = await new Models.Team({
          _id: newTeamId,
          fullname,
          teamname,
          elo,
          owner: user.id,
          members: [newMemberId]
        }).save(opts);
        await new Models.Member({
          _id: newMemberId,
          user: user.id,
          team: newTeamId,
          role: MemberRole.ADMIN
        }).save(opts);
        await Models.User.findOneAndUpdate({ _id: user.id }, { $push: { memberTeams: newMemberId }}, opts);
      });
      session.endSession();
      return newTeam;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },

  getTeamsUser: async (username) => {
    try {
      return Models.User.findOne({ username })
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

  getTeamDetail: async (teamId) => {
    try {
      return Models.Team.findOne({_id: teamId})
      .populate({
        path: 'members',
        populate: [{ path: 'user' }],
      })
      .sort({ role: 'asc' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}