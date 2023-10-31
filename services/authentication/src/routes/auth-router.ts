import { Router } from "express";
import { login, logout, refresh, create, isVerified } from "../controllers/auth-controller";
const router = Router();

router.post("/login", login);
router.post("/", create)
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/:id/is-verified", isVerified);

export default router;