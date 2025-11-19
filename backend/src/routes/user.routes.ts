import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteAccount);
router.put('/preferences', userController.updatePreferences);
router.get('/stats', userController.getUserStats);

export default router;
