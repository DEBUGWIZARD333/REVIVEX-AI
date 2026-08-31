import express from 'express';
import {
  getRecoveryEvents,
  getRecoveryMetrics,
  getRecoverySummary,
} from '../controllers/recoveryAnalyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/events', getRecoveryEvents);
router.get('/metrics', getRecoveryMetrics);
router.get('/summary', getRecoverySummary);

// Individual Metric API Endpoints
router.get('/revenue-at-risk', async (req, res, next) => {
  try {
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics(req.query);
    res.json({ success: true, metric: 'revenueAtRisk', value: metrics.revenueAtRisk });
  } catch (err) { next(err); }
});

router.get('/recovered-revenue', async (req, res, next) => {
  try {
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics(req.query);
    res.json({ success: true, metric: 'recoveredRevenue', value: metrics.recoveredRevenue });
  } catch (err) { next(err); }
});

router.get('/failed-payments', async (req, res, next) => {
  try {
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics(req.query);
    res.json({ success: true, metric: 'failedPayments', value: metrics.failedPayments });
  } catch (err) { next(err); }
});

router.get('/abandoned-carts', async (req, res, next) => {
  try {
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics(req.query);
    res.json({ success: true, metric: 'abandonedCarts', value: metrics.abandonedCarts });
  } catch (err) { next(err); }
});

router.get('/agent-decisions', async (req, res, next) => {
  try {
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics(req.query);
    res.json({ success: true, metric: 'agentDecisions', value: metrics.agentDecisions });
  } catch (err) { next(err); }
});

export default router;
