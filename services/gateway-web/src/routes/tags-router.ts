import { Router } from "express";
import * as tagsCtrl from "../controllers/tags-controller";

const router = Router();

router.get('/', tagsCtrl.getDefaultTags);
router.get('/suggestions', tagsCtrl.getTagSuggestions);

export default router;