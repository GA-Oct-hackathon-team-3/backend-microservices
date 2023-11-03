import { Router } from "express";
import * as giftCtrl from '../controllers/gifts-controller';

const router = Router();


router.post('/', giftCtrl.generateGift);


export default router