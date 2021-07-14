import _ from 'lodash';
import Mongoose from 'mongoose';
import Schedule from 'node-schedule';
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';
import MatchupService from '../services/matchup.service';

const setStatusIsMyTeamAdminMatchup = (setTeam, matchup) => {
  matchup.attentions = _.map(matchup.attentions, item => {
    item = setStatusIsMyTeamAdminAttention(setTeam, item)
    // item.is_my_team_admin_attention = setTeam.has(_.get(item, 'teamCreate._id').toString())
    return item;
  })
  matchup.is_my_team_admin_matchup = setTeam.has(_.get(matchup, 'teamCreate._id').toString())
  return matchup
}

const setStatusIsMyTeamAdminAttention = (setTeam, attention) => {
  attention.is_my_team_admin_attention = setTeam.has(_.get(attention, 'teamCreate._id').toString())
  return attention
}

export default {
  apiCreateMatchup: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const teamname = data.teamname;
    const stadium = data.stadium_id;
    const timeStart = data.time_start;
    const description = data.description;
    try {
      if (!teamname) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const team = await Models.Team.findOne({ teamname });
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      const timeStartDate = new Date(timeStart);
      // console.log(timeStartDate);
      if (!timeStart || _.isNaN(timeStartDate.getTime()) || timeStartDate.getTime() <= (new Date()).getTime()) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Time start invalid');
      }
      const authAdmin = await Models.Member.findOne({
        user: authUser.id,
        team: team.id,
      });
      if (_.get(authAdmin, 'role') != 'admin') {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      const newMatchup = await new Models.Matchup({
        userCreate: authUser.id,
        teamCreate: team.id,
        description,
        stadium,
        timeStart: timeStartDate,
        status: 'active'
      }).save();

      Schedule.scheduleJob(timeStartDate, async function(){
        await Models.Matchup.findOneAndUpdate({ _id: newMatchup.id, status: 'active' }, { status: 'overdue' });
      });

      return ResponseDtos.createSuccessResponse(res, newMatchup);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiDeleteMatchup: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const matchupId = data.matchup_id;
    try {
      if (!matchupId) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const matchup = await Models.Matchup.findOne({ _id: matchupId });
      if (_.get(matchup, 'status') == 'matched') {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, 'Matchup already matched');
      }
      const authAdmin = await Models.Member.findOne({
        user: authUser.id,
        team: matchup.teamCreate,
      });
      if (_.get(authAdmin, 'role') != 'admin') {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      const deletedMatchup = await Models.Matchup.findOneAndUpdate({ _id: matchupId }, { status: 'deleted' }, { returnOriginal: false });

      return ResponseDtos.createSuccessResponse(res, deletedMatchup);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetListMatchupTeam: async (req, res) => {
    const query = req.query;
    const teamname = query.teamname;
    const authUser = req.authUser;
    try {
      if (!teamname) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const team = await Models.Team.findOne({ teamname });
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      const setTeamAdmin = await MatchupService.getSetTeamAdmin(authUser.id);
      const listAttented = await Models.AttentionMatchup.find({ teamCreate: team.id })
      const listIdMatchUpAttented = _.map(listAttented, 'matchup')
      let listMatchUp = await Models.Matchup.find().and([
        { $or: [{ _id: listIdMatchUpAttented }, { teamCreate: team.id }] },
        { status: 'active' },
      ]).populate('teamCreate').populate({
        path: 'attentions',
        model: Models.AttentionMatchup,
        populate: {
          path: 'teamCreate',
          model: Models.Team,
        }
      }).populate({
        path: 'stadium',
        model: Models.Stadium
      }).lean();
      listMatchUp = _.map(listMatchUp, item => {
        return setStatusIsMyTeamAdminMatchup(setTeamAdmin, item)
      })
      return ResponseDtos.createSuccessResponse(res, listMatchUp);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetAllMatchup: async (req, res) => {
    const query = req.query;
    const stadiumID = query.stadium_id;
    const timeFrom = query.time_from;
    const timeTo = query.time_to;
    const authUser = req.authUser;
    try {
      const setTeamAdmin = await MatchupService.getSetTeamAdmin(authUser.id);
      let query = {
        status: 'active',
        stadium: (stadiumID) ? Mongoose.Types.ObjectId(stadiumID) : null,
        timeStart: {
          $gte: (timeFrom) ? new Date(timeFrom) : null, 
          $lte: (timeTo) ? new Date(timeTo) : null
        }
      }
      query.timeStart = _.omitBy(query.timeStart, _.isNil)
      if(_.isEqual(query.timeStart, {})) {
        query.timeStart = null;
      }
      query = _.omitBy(query, _.isNil)
      let listMatchUp = await Models.Matchup.find(query).populate('teamCreate').populate({
        path: 'attentions',
        model: Models.AttentionMatchup,
        populate: {
          path: 'teamCreate',
          model: Models.Team,
        }
      }).populate({
        path: 'stadium',
        model: Models.Stadium
      }).lean();
      listMatchUp = _.map(listMatchUp, item => {
        return setStatusIsMyTeamAdminMatchup(setTeamAdmin, item)
      })
      // await Models.Matchup.updateMany({
      //   timeStart: {
      //     $lte: new Date()
      //   },
      //   status: 'active',
      // }, {
      //   status: 'overdue',
      // })
      return ResponseDtos.createSuccessResponse(res, listMatchUp);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetDetailMatchUp: async (req, res) => {
    const query = req.query;
    const id = query.matchup_id;
    const authUser = req.authUser;
    try {
      if (!id) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const setTeamAdmin = await MatchupService.getSetTeamAdmin(authUser.id);
      let matchup = await Models.Matchup.findOne({ _id: id })
        .populate('teamCreate')
        .populate({
          path: 'userCreate',
          select: 'fullName username image imagePublicId'
        })
        .populate({
          path: 'attentions',
          model: Models.AttentionMatchup,
          populate: {
            path: 'teamCreate',
            model: Models.Team,
          }})
        .populate({
          path: 'stadium',
          model: Models.Stadium
      }).lean();
      if (!matchup) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Matchup not found');
      }
      matchup = setStatusIsMyTeamAdminMatchup(setTeamAdmin, matchup)
      // matchup.is_my_team_admin_matchup = setTeamAdmin.has(_.get(matchup, 'teamCreate._id').toString())
      return ResponseDtos.createSuccessResponse(res, matchup);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiCreateAttention: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const teamname = data.teamname;
    const matchupId = data.matchup_id;
    try {
      if (!matchupId || !teamname) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const [matchup, team] = await Promise.all([
        Models.Matchup.findOne({ _id: matchupId }),
        Models.Team.findOne({ teamname }).populate('members')
      ]) 
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      if (!matchup) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Matchup not found');
      }
      if (matchup.teamCreate == team.id) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'U r fukin yourself');
      }
      const listUserMemberTeam = _.map(_.get(team, 'members'), item => {
        return _.get(item, 'user').toString()
      })
      if (!listUserMemberTeam.includes(authUser.id)) {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      const attention = await Models.AttentionMatchup.findOne({
        matchup: matchupId,
        teamCreate: team.id
      })
      if (attention) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Attention matchup already existed');
      }
      
      const dataAttentionInsert = {
        teamCreate: team.id,
        userCreate: authUser.id,
        matchup: matchupId,
      }
      const newAttention = await MatchupService.createAttention(dataAttentionInsert)
      return ResponseDtos.createSuccessResponse(res, newAttention);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiRemoveAttention: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const attentionId = data.attention_id;
    try {
      const attention = await Models.AttentionMatchup.findOne({_id: attentionId});
      if (!attention) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Matchup attention not found');
      }
      if (attention.status != 'active') {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Matchup attention not activated');
      }
      const authAdmin = await Models.Member.findOne({
        user: authUser.id,
        team: attention.teamCreate,
      })
      if (authAdmin.role != 'admin' && authUser.id != attention.userCreate) {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      const removedAttention = await MatchupService.removeAttention(attentionId, attention.matchup)
      return ResponseDtos.createSuccessResponse(res, removedAttention);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiConfirmMatchup: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const attentionId = data.attention_id;
    const stadium = data.stadium_id;
    const timeStart = data.time_start;
    try {
      const attention = await Models.AttentionMatchup.findOne({ _id: attentionId }).populate({
        path: 'matchup',
        model: Models.Matchup
      }).populate('teamCreate');
      const authAdmin = await Models.Member.findOne({
        user: authUser.id,
        team: _.get(attention, 'matchup.teamCreate'),
      })
      if (!authAdmin || _.get(authAdmin, 'role') != 'admin') {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, MessageRes.PERMISSIONS_DENIED);
      }
      const dataMatch = {
        teamAId: _.get(attention, 'matchup.teamCreate'),
        teamBId: _.get(attention, 'teamCreate.id'),
        matchup: _.get(attention, 'matchup.id'),
        stadium: stadium || _.get(attention, 'matchup.stadium'),
        timeStart: timeStart || _.get(attention, 'matchup.timeStart'),
      }
      const newMatch = await MatchupService.confirmMatchup(dataMatch)
      Schedule.scheduleJob(new Date(newMatch.timeStart), function(){
        Models.Match.findOneAndUpdate({ _id: newMatch.id, status: 'active' }, { status: 'happened' });
      });
      return ResponseDtos.createSuccessResponse(res, newMatch);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  }
}