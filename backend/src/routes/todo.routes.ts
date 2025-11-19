import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as todoController from '../controllers/todo.controller';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(todoController.getTodos)
  .post(todoController.createTodo);

router.route('/:id')
  .get(todoController.getTodo)
  .put(todoController.updateTodo)
  .delete(todoController.deleteTodo);

router.patch('/:id/toggle', todoController.toggleTodo);

export default router;
