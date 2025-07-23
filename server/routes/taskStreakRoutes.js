import express from 'express';
import { markTaskCompleteToday,getStreaks } from '../controllers/TaskStreakController.js';

const router = express.Router();
router.get('/', getStreaks);
router.post('/mark-complete', markTaskCompleteToday);  // Mark today's task as done

export default router;
