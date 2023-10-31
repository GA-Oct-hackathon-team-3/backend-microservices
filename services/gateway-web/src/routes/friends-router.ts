import { Router } from "express";
import * as friendsCtrl from '../controllers/friends-controller';
import requireLogin from "../middleware/require-login";

const router = Router();

router.post('/create', requireLogin, friendsCtrl.create);
router.get('/', friendsCtrl.getAll);
router.get('/:id', friendsCtrl.getOne);

export default router;