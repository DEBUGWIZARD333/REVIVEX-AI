import express from 'express';
import {
  createDecision,
  getDecisions,
  getDecisionById,
  getDecisionStats,
} from '../controllers/decisionController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Allow optionalAuth for programmatic decision logging
router.post('/', optionalAuth, createDecision);

// Route for aggregate decision statistics (/api/decisions/stats or /api/decision-stats)
router.get('/stats', protect, getDecisionStats);

// Protected query routes
router.get('/', protect, getDecisions);
router.get('/:id', protect, getDecisionById);

export default router;
