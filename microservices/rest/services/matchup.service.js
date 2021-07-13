import _ from 'lodash';
import mongoose from 'mongoose';
import Models from '../../../models/index';

export default {
  createAttention: async (data, user) => {
    const matchupId = data.matchup
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      let newAttention = null;
      await session.withTransaction(async () => {
        const opts = { session };
        newAttention = await new Models.AttentionMatchup(data).save(opts);
        await Models.Matchup.findOneAndUpdate({ _id: matchupId }, { $push: { attentions: newAttention.id }}, opts);
      });
      session.endSession();
      return newAttention;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },

  removeAttention: async (attentionId, matchupId) => {
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      let removedAttention = null;
      await session.withTransaction(async () => {
        const opts = { session };
        removedAttention = await Models.AttentionMatchup.findByIdAndRemove(attentionId, opts);
        await Models.Matchup.findOneAndUpdate({ _id: matchupId }, { $pull: { attentions: attentionId }}, opts);
      });
      session.endSession();
      return removedAttention;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },

  confirmMatchup: async (data) => {
    const matchupId = data.matchup
    const session = await mongoose.connection.startSession()
    // session.startTransaction();
    try {
      let newMatch = null;
      await session.withTransaction(async () => {
        const opts = { session };
        await Models.Matchup.findOneAndUpdate({ _id: matchupId }, { status: 'matched'}, opts);
        newMatch = await new Models.Match({
          teamA: data.teamAId,
          teamB: data.teamBId,
          matchup: data.matchup,
          stadium: data.stadium,
          timeStart: data.timeStart,
          status: 'pending'
        }).save(opts);
        await Models.Team.findOneAndUpdate({ _id: data.teamAId }, { $push: { matchs: newMatch.id }}, opts);
        await Models.Team.findOneAndUpdate({ _id: data.teamBId }, { $push: { matchs: newMatch.id }}, opts);
      });
      session.endSession();
      return newMatch;
    } catch (error) {
      session.endSession();
      console.log(error);
      throw error;
    }
  },

  getSetTeamAdmin: async (userID) => {
    try {
      const authAdmin = await Models.Member.find({
        user: userID,
        role: 'admin'
      }).lean();
      const setTeamAdmin = new Set()
      _.forEach(authAdmin, item => {
        setTeamAdmin.add(_.get(item, 'team').toString())
      });
      return setTeamAdmin
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}