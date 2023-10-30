import { Router } from "express";
import { login, logout, refresh, create } from "../controllers/auth-controller";
const router = Router();

router.post("/login", login);
router.post("/", create)
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;