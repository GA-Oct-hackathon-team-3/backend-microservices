import { Router } from "express";
import * as friendsCtrl from '../controllers/friends-controller';

const router = Router();

router.post('/create', friendsCtrl.create);
router.post('/', friendsCtrl.getAll);

export default router;