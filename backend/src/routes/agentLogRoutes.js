import express from 'express';
import { createLog, getLogs, getLogsByEvent } from '../controllers/agentLogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to create a new agent log entry
router.post('/', createLog);

// Routes to fetch agent execution logs (protected)
router.get('/', protect, getLogs);
router.get('/event/:eventId', protect, getLogsByEvent);

export default router;
