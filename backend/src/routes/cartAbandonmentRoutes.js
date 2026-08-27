import express from 'express';
import {
  runDetection,
  startJob,
  stopJob,
  getJobStatus,
} from '../controllers/cartAbandonmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getJobStatus);
router.post('/run', protect, runDetection);
router.post('/start-job', protect, startJob);
router.post('/stop-job', protect, stopJob);

export default router;
