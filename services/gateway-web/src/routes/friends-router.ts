import { Router } from "express";
import * as friendsCtrl from '../controllers/friends-controller';
import requireLogin from "../middleware/require-login";

const router = Router();

router.post('/create', requireLogin, friendsCtrl.create);
router.get('/', requireLogin, friendsCtrl.getAll);
router.get('/:id', requireLogin, friendsCtrl.getOne);
router.put('/:id/update', requireLogin, friendsCtrl.update);

export default router;