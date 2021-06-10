import express from 'express';
import MatchupController from '../controllers/stadium.controller';
import { authorizationToken } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/matchup/create', authorizationToken, MatchupController.apiCreateMatchup);
// router.get('/matchup/getAll', authorizationToken, MatchupController.apiGetListMatchup);
router.get('/matchup/getDetail', authorizationToken, MatchupController.apiGetDetailMatchUp);
// router.post('/matchup/createCare', authorizationToken, MatchupController.apiCreateCare);
// router.post('/matchup/confirm', authorizationToken, MatchupController.apiConfirmMatchup);
export default router
