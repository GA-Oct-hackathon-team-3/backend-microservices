import { Router } from "express";
import * as userCtrl from '../controllers/user-controller';
import requireLogin from "../middleware/require-login";

const router = Router();

router.post('/', userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/logout', requireLogin, userCtrl.logout);

export default router;