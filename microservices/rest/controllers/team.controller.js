// router.post('team/create', TeamController.apiCreateTeam);
// router.post('team/edit', TeamController.apiEditTeam);
// router.get('team/detail', TeamController.apiGetDetailTeam);
import _ from 'lodash';
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';
import TeamService from '../services/team.service';

export default {
  apiCreateTeam: async (req, res) => {
    const data = req.body;
    const authUser = req.authUser;
    const fullname = data.fullname;
    const elo = data.elo;
    let teamname = data.teamname;
    try {
      if (!fullname || !teamname || !elo) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      teamname = `team_${teamname.toString().trim().toLowerCase()}`
      const team = await Models.Team.findOne({ teamname });
      if (team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.CONFLICT, MessageRes.CONFLICT);
      }
      data.teamname = teamname;
      const newTeam = await TeamService.createTeam(data, authUser);
      return ResponseDtos.createSuccessResponse(res, newTeam);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetTeamsUser: async (req, res) => {
    const query = req.query;
    const userId = query.user_id;
    try {
      if (!userId) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const user = await TeamService.getTeamsUser(userId);
      const output = _.map(user.memberTeams, item => {
        return {
          id: _.get(item, 'team.id'),
          fullname: _.get(item, 'team.fullname'),
          teamname: _.get(item, 'team.teamname'),
          is_owner: !!(_.get(item, 'team.owner') == userId),
          role: _.get(item, 'role'),
          create_at: _.get(item, 'team.createdAt'),
          join_at: _.get(item, 'createdAt'),
        }
      })
      return ResponseDtos.createSuccessResponse(res, output);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiGetTeamsDetail: async (req, res) => {
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
      const teamDetail = await TeamService.getTeamDetail(team.id);
      const teamMember = _.map(_.get(teamDetail, 'members'), (item) => {
        return {
          member_id: _.get(item, '_id'),
          username: _.get(item, 'user.username'),
          fullname: _.get(item, 'user.fullName'),
          image: _.get(item, 'user.image'),
          image_public_id: _.get(item, 'user.imagePublicId'),
          email: _.get(item, 'user.email'),
          role: _.get(item, 'role'),
          join_at: _.get(item, 'createdAt'),
        }
      })
      const output = {
        id: _.get(teamDetail, '_id'),
        fullname: _.get(teamDetail, 'fullname'),
        teamname: _.get(teamDetail, 'teamname'),
        elo: _.get(teamDetail, 'elo'),
        create_at: _.get(teamDetail, 'createAt'),
        member: teamMember,
      }
      return ResponseDtos.createSuccessResponse(res, output);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  }
}