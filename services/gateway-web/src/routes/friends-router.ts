import { Router } from "express";
import * as friendsCtrl from '../controllers/friends-controller';
import * as giftCtrl from '../controllers/gifts-controller'
import requireLogin from "../middleware/require-login";

const router = Router();

router.post('/create', requireLogin, friendsCtrl.create);
router.get('/', requireLogin, friendsCtrl.getAll);
router.get('/:id', requireLogin, friendsCtrl.getOne);
router.put('/:id/update', requireLogin, friendsCtrl.update);
router.post('/:id/tags',requireLogin, friendsCtrl.updateTags);

router.post('/:id/generate-gift', requireLogin, giftCtrl.recommendGift);
router.post('/:id/favorites', requireLogin, giftCtrl.favoriteGift);
router.get('/:id/favorites', requireLogin, giftCtrl.getFavoritesOfFriend);
router.delete('/:id/favorites/:favoriteId', requireLogin, giftCtrl.removeFavorite);

export default router;