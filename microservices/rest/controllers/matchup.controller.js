import _ from 'lodash';
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';
import MatchupService from '../services/matchup.service';

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
        timeStart: new Date(timeStart),
        status: 'active'
      }).save();
      return ResponseDtos.createSuccessResponse(res, newMatchup);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetListMatchupTeam: async (req, res) => {
    const query = req.query;
    const teamname = query.teamname;
    try {
      if (!teamname) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const team = await Models.Team.findOne({ teamname });
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      const listAttented = await Models.AttentionMatchup.find({ teamCreate: team.id })
      const listIdMatchUpAttented = _.map(listAttented, 'matchup')
      const listMatchUp = await Models.Matchup.find().and([
        { $or: [{ _id: listIdMatchUpAttented }, { teamCreate: team.id }] },
        { status: 'active' },
      ]).populate('teamCreate').populate({
        path: 'stadium',
        model: Models.Stadium
      });
      return ResponseDtos.createSuccessResponse(res, listMatchUp);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetAllMatchup: async (req, res) => {
    const query = req.query;
    try {
      const listMatchUp = await Models.Matchup.find({ status: 'active' }).populate('teamCreate').populate({
        path: 'stadium',
        model: Models.Stadium
      });
      return ResponseDtos.createSuccessResponse(res, listMatchUp);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetDetailMatchUp: async (req, res) => {
    const query = req.query;
    const id = query.matchup_id;
    try {
      if (!id) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const matchup = await Models.Matchup.findOne({ _id: id }).populate('teamCreate').populate({
        path: 'attentions',
        model: Models.AttentionMatchup,
        populate: 'teamCreate'
      }).populate({
        path: 'stadium',
        model: Models.Stadium
      });
      if (!matchup) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Matchup not found');
      }
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
      return ResponseDtos.createSuccessResponse(res, newMatch);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  }
}