import express from 'express';
import { sendEmail, getTemplates } from '../controllers/emailController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// List available email templates
router.get('/templates', protect, getTemplates);

// Send recovery email
router.post('/send', optionalAuth, sendEmail);

export default router;
