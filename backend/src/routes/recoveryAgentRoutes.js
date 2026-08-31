import express from 'express';
import {
  processDecision,
  getStatus,
  startWorker,
  stopWorker,
  validateAccuracy,
} from '../controllers/recoveryAgentController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getStatus);
router.post('/validate-accuracy', protect, validateAccuracy);
router.post('/process', optionalAuth, processDecision);
router.post('/start-worker', protect, startWorker);
router.post('/stop-worker', protect, stopWorker);

export default router;
