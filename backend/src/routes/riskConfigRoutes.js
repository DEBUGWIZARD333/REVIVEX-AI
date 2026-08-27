import express from 'express';
import {
  getRiskConfig,
  updateRiskConfig,
  evaluateEventRisk,
} from '../controllers/riskConfigController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRiskConfig);
router.put('/', protect, updateRiskConfig);
router.post('/evaluate', protect, evaluateEventRisk);

export default router;
