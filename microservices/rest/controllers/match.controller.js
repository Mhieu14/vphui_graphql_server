import _ from 'lodash';
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';

export default {
  apiGetListMatchTeam: async (req, res) => {
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
      const listMatchId = _.get(team, 'matchs');
      const listMatch = await Models.Match.find({ _id: listMatchId }).populate('teamA').populate('teamB').populate({
        path: 'stadium',
        model: Models.Stadium
      });
      return ResponseDtos.createSuccessResponse(res, listMatch);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetDetailMatch: async (req, res) => {
    const query = req.query;
    const id = query.match_id;
    try {
      if (!id) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const match = await Models.Match.findOne({ _id: id }).populate('teamA').populate('teamB').populate({
        path: 'stadium',
        model: Models.Stadium
      });
      if (!match) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Match not found');
      }
      return ResponseDtos.createSuccessResponse(res, match);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetListMatchUser: async (req, res) => {
    const username = req.query.username;
    try {
      if (!username) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const user = await Models.User.findOne({ username })
      if (!user) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'User not found');
      }
      const listTeamUser = await Models.Member.find({ user: user.id });
      const listTeamId = _.map(listTeamUser, 'team');
      const listMatch = await Models.Match.find().or([
        { teamA : listTeamId },
        { teamB : listTeamId }
      ])
      return ResponseDtos.createSuccessResponse(res, listMatch)
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiUpdateMatchResult: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser; 
    const matchId = data.match_id;
    const totalGoalA = parseInt(data.total_goals_a, 10) || 0;
    const totalGoalB = parseInt(data.total_goals_b, 10) || 0;
    const isCancel = data.isCancel;
    try {
      if (!matchId) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const match = await Models.Match.findOne({ _id: matchId })
      if (!match) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Match not found');
      }
      const idTeamA = _.get(match, 'teamA');
      const idTeamB = _.get(match, 'teamB');
      if (isCancel) {
        const teamResult = await Models.Match.findOneAndUpdate({ _id: matchId }, {status: 'cancelled'}, { returnOriginal: false });
      } else {
        const listAdmin = await Models.Member.find({
          team: [idTeamA, idTeamB],
          role: 'admin',
          user: authUser.id,
        }) 
        // console.log(listAdmin);
        let updateObject = null
        if ( listAdmin.length == 0 ) {
          return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
        } 
        else if ( listAdmin.length == 1 ) {
          idTeamUser = _.get(listAdmin[0], 'team')
          if ( idTeamA == idTeamUser ) {
            updateObject = {
              teamAGoalUpdateByA : totalGoalA,
              teamBGoalUpdateByA : totalGoalB
            }
          };
          if ( idTeamB == idTeamUser ) {
            updateObject = {
              teamAGoalUpdateByB : totalGoalA,
              teamBGoalUpdateByB : totalGoalB
            }
          };
        } 
        else if ( listAdmin.length == 2 ) {
          updateObject = {
            teamAGoalUpdateByA : totalGoalA,
            teamBGoalUpdateByA : totalGoalB,
            teamAGoalUpdateByB : totalGoalA,
            teamBGoalUpdateByB : totalGoalB
          }
        }
        updateObject.status = 'finished'
        const teamResult = await Models.Match.findOneAndUpdate({ _id: matchId }, updateObject, { returnOriginal: false });
        return ResponseDtos.createSuccessResponse(res, teamResult)
      }
    } catch(error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  }
}