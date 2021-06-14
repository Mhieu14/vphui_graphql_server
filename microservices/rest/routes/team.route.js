import express from 'express';
import MemberController from '../controllers/member.controller';
import TeamController from '../controllers/team.controller';
// import DiscussController from'../controllers/discuss.controller';
import { authorizationToken } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/team/create', authorizationToken, TeamController.apiCreateTeam);
router.get('/team/getListTeamsUser', authorizationToken, TeamController.apiGetTeamsUser)
// router.post('/team/edit', authorizationToken, TeamController.apiEditTeam);
router.get('/team/detail', authorizationToken, TeamController.apiGetTeamsDetail);

router.post('/member/add', authorizationToken, MemberController.apiAddTeamMember);
router.post('/member/remove', authorizationToken, MemberController.apiRemoveMember);
router.post('/member/markAdmin', authorizationToken, MemberController.apiMarkMemberAsAdmin);
// router.get('/member/read', authorizationToken, MemberController.apiGetAllMember);
export default router
