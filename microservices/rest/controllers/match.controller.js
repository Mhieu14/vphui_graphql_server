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
}