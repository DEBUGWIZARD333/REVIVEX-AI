import express from 'express';
import {
  createRiskEvent,
  getRiskEvents,
  getRiskEventById,
  updateStatus,
  getRiskStats,
} from '../controllers/riskEventController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / optional auth for triggering risk events
router.post('/', optionalAuth, createRiskEvent);

// Route for aggregate risk stats
router.get('/stats', protect, getRiskStats);

// Protected query routes
router.get('/', protect, getRiskEvents);
router.get('/:id', protect, getRiskEventById);
router.put('/:id/status', protect, updateStatus);

export default router;
