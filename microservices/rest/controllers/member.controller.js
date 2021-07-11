// router.post('/member/edit', authorizationToken, MemberController.apiEditMember);
// router.get('/member/read', authorizationToken, MemberController.apiGetAllMember);

import _ from 'lodash';
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';
import MemberService from '../services/member.service';

export default {
  apiAddTeamMember: async (req, res) => {
    const data = req.body;
    const teamname = data.teamname;
    const username = data.username;
    const authUser = req.authUser;
    try {
      if (!teamname || !username) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const [team, user] = await Promise.all([
        await Models.Team.findOne({ teamname }),
        await Models.User.findOne({ username }),
      ])
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      if (!user) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'User not found');
      }
      const [member, authAdmin] = await Promise.all([
        Models.Member.findOne({
          user: user.id,
          team: team.id,
        }),
        Models.Member.findOne({
          user: authUser.id,
          team: team.id,
        }),
      ]) 
      if (member) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Member already existed');
      }
      if (_.get(authAdmin, 'role') != 'admin') {

        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      const newMember = await MemberService.addMember(team.id, user.id)
      let output = {
        username: username,
        fullname: user.fullName,
        role: newMember.role,
        create_at: newMember.createdAt,
      }
      return ResponseDtos.createSuccessResponse(res, output);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiRemoveMember: async (req, res) => {
    const data = req.body;
    const teamname = data.teamname;
    const username = data.username;
    const authUser = req.authUser;
    try {
      if (!teamname || !username) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const [team, user] = await Promise.all([
        await Models.Team.findOne({ teamname }),
        await Models.User.findOne({ username }),
      ])
      if (!team) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Team not found');
      }
      if (!user) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'User not found');
      }
      const [member, authRequester] = await Promise.all([
        Models.Member.findOne({
          user: user.id,
          team: team.id,
        }),
        Models.Member.findOne({
          user: authUser.id,
          team: team.id,
        }),
      ]) 
      if (!member) {
        return ResponseDtos.createErrorResponse(res, StatusCode.BAD_REQUEST, 'Member not existed');
      }
      if (!authRequester) {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      if (_.get(authRequester, 'role') != 'admin' && authRequester.user != user.id) {
        return ResponseDtos.createErrorResponse(res, StatusCode.FORBIDDEN, MessageRes.PERMISSIONS_DENIED);
      }
      
      const removedMember = await MemberService.removeMember(team.id, user.id, member.id)
      return ResponseDtos.createSuccessResponse(res, removedMember);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  apiMarkMemberAsAdmin: async (req, res) => {
    const data = req.body;
    const memberId = data.member_id;
    const teamname = data.teamname;
    const authUser = req.authUser;
    try {
      if (!memberId || !teamname) {
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
      
      const newMember = await Models.Member.findOneAndUpdate({ _id: memberId }, { role: 'admin' }, { returnOriginal: false });
      return ResponseDtos.createSuccessResponse(res, newMember);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },
}