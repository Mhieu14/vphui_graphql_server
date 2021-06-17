import express from 'express';
import MatchController from '../controllers/match.controller';
import MatchupController from '../controllers/matchup.controller';
import { authorizationToken } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/matchup/create', authorizationToken, MatchupController.apiCreateMatchup);
router.get('/matchup/getListMatchupTeam', authorizationToken, MatchupController.apiGetListMatchupTeam);
router.get('/matchup/getAll', authorizationToken, MatchupController.apiGetAllMatchup);
router.get('/matchup/getDetail', authorizationToken, MatchupController.apiGetDetailMatchUp);

router.post('/matchup/createAttention', authorizationToken, MatchupController.apiCreateAttention);
router.post('/matchup/removeAttention', authorizationToken, MatchupController.apiRemoveAttention);
router.post('/matchup/confirmAttention', authorizationToken, MatchupController.apiConfirmMatchup);

router.get('/match/detail', authorizationToken, MatchController.apiGetDetailMatch);
router.get('/match/listMatchTeam', authorizationToken, MatchController.apiGetListMatchTeam);
router.get('/match/listMatchUser', authorizationToken, MatchController.apiGetListMatchUser);
router.post('/match/updateMatchResult', authorizationToken, MatchController.apiUpdateMatchResult);

export default router
