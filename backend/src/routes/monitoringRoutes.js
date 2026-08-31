import express from 'express';
import {
  runSingleCycle,
  startAgent,
  stopAgent,
  getStatus,
  getIntegrityReport,
} from '../controllers/monitoringController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getStatus);
router.get('/integrity-report', protect, getIntegrityReport);
router.post('/run', protect, runSingleCycle);
router.post('/start', protect, startAgent);
router.post('/stop', protect, stopAgent);

export default router;
