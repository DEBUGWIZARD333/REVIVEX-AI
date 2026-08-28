import express from 'express';
import { generateLink, validateToken } from '../controllers/recoveryLinkController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Generate secure recovery URL
router.post('/generate', optionalAuth, generateLink);

// Validate & redeem token
router.get('/validate/:token', validateToken);

export default router;
