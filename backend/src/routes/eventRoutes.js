import express from 'express';
import { logEvent, getEvents, getUserEvents } from '../controllers/eventController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / optional auth for logging events
router.post('/', optionalAuth, logEvent);

// Query events (protected or open for internal consumption)
router.get('/', protect, getEvents);
router.get('/user/:userId', protect, getUserEvents);

export default router;
