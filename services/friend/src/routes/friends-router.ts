import { Router } from "express";
import * as friendsCtrl from '../controllers/friends-controller';

const router = Router();

router.post('/create', friendsCtrl.create);
router.post('/', friendsCtrl.getAll);
router.post('/:id', friendsCtrl.getOne);

export default router;