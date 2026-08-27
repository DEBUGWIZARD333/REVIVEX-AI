import express from 'express';
import { logEvent, getEvents, getEventStats, getUserEvents } from '../controllers/eventController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / optional auth for logging events
router.post('/', optionalAuth, logEvent);

// Route for aggregate event statistics (must come before parametric routes)
router.get('/stats', protect, getEventStats);

// Query events with pagination, filtering, and sorting
router.get('/', protect, getEvents);

// Get user specific events
router.get('/user/:userId', protect, getUserEvents);

export default router;
