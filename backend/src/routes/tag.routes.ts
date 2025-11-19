import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as tagController from '../controllers/tag.controller';

const router = Router();

router.use(protect);

router.route('/')
  .get(tagController.getTags)
  .post(tagController.createTag);

router.route('/:id')
  .get(tagController.getTag)
  .put(tagController.updateTag)
  .delete(tagController.deleteTag);

export default router;
