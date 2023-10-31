import { Router } from "express";
import * as userCtrl from "../controllers/user-controller";
const router = Router();

router.get('/:id', userCtrl.get);
router.put('/:id', userCtrl.update);

export default router;