import express from 'express';
import StadiumController from '../controllers/stadium.controller';
const router = express.Router();

router.post('/stadium/create', StadiumController.apiCreateStadium);
// router.get('/stadium/detail', StadiumController.apiGetDetailStadium);
router.get('/stadium/getAll', StadiumController.apiGetListStadium);
export default router
