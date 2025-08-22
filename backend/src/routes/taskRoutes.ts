import { Router } from 'express';
import { createTask, getTasksByProject, updateTask, deleteTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/projects/:projectId/tasks').post(protect, createTask).get(protect, getTasksByProject);
router.route('/tasks/:id').put(protect, updateTask).delete(protect, deleteTask);

export default router;
