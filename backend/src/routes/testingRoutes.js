import express from 'express';
import {
  runScenario,
  retryScenario,
  getTestResults,
  getTestResultById,
  clearTestResults,
} from '../controllers/testController.js';

const router = express.Router();

router.post('/run-scenario', runScenario);
router.post('/retry/:id', retryScenario);
router.get('/results', getTestResults);
router.get('/results/:id', getTestResultById);
router.delete('/results', clearTestResults);

export default router;
