import express from 'express';
import { executeWorkflow, getRules } from '../controllers/recoveryWorkflowController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/rules', protect, getRules);
router.post('/execute', optionalAuth, executeWorkflow);

export default router;
