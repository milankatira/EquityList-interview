import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/').get(protect, getUsers);

export default router;
