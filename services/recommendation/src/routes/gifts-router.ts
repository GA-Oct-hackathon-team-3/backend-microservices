import { Router } from "express";
import * as giftCtrl from '../controllers/gifts-controller';

const router = Router();


router.post('/', giftCtrl.generateGift);
router.post('/favorites', giftCtrl.getFavoritesOfFriend);
router.post('/favorites/add', giftCtrl.favoriteGift);
router.post('/favorites/delete', giftCtrl.removeFavorite);


export default router