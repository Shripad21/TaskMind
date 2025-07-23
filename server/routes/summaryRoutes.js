import express from 'express';
import { logDailySummary,getDailySummary } from '../controllers/UserDailySummaryController.js';

const router = express.Router();

router.post('/log-summary', logDailySummary);  // Store daily summary for a user
router.get('/:date', getDailySummary);  
export default router;
