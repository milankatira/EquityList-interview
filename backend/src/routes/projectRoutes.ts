import { Router } from 'express';
import { createProject, getProjects, getProjectById, deleteProject } from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById).delete(protect, deleteProject);

export default router;
