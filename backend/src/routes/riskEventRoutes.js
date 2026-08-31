import express from 'express';
import {
  createRiskEvent,
  getRiskEvents,
  getRiskEventById,
  updateStatus,
  getRiskStats,
  validateAccuracy,
} from '../controllers/riskEventController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / optional auth for triggering risk events
router.post('/', optionalAuth, createRiskEvent);

// Route for aggregate risk stats & validation suite
router.get('/stats', protect, getRiskStats);
router.post('/validate-accuracy', protect, validateAccuracy);

// Protected query routes
router.get('/', protect, getRiskEvents);
router.get('/:id', protect, getRiskEventById);
router.put('/:id/status', protect, updateStatus);

export default router;
