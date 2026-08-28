import express from 'express';
import {
  getRecoveryEvents,
  getRecoveryMetrics,
  getRecoverySummary,
} from '../controllers/recoveryAnalyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/events', getRecoveryEvents);
router.get('/metrics', getRecoveryMetrics);
router.get('/summary', getRecoverySummary);

export default router;
