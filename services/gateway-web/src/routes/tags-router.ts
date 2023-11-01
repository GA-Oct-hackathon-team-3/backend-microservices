import { Router } from "express";
import { getAll } from "../controllers/tags-controller";

const router = Router();

router.get('/', getAll);

export default router;