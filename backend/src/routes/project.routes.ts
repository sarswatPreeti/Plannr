import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.use(protect);

router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProject)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

export default router;
