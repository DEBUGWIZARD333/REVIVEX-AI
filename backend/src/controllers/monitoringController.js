import * as monitoringService from '../services/monitoringAgentService.js';
import { globalEventIntegrityValidator } from '../services/eventIntegrityValidator.js';

export const runSingleCycle = async (req, res, next) => {
  try {
    const { batchSize } = req.body;
    const size = parseInt(batchSize, 10) || 10;
    const result = await monitoringService.runMonitoringCycle(size);
    res.json({
      success: true,
      message: 'Monitoring cycle executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const startAgent = async (req, res, next) => {
  try {
    const { intervalMs } = req.body;
    const ms = parseInt(intervalMs, 10) || 5000;
    const result = monitoringService.startMonitoringAgent(ms);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const stopAgent = async (req, res, next) => {
  try {
    const result = monitoringService.stopMonitoringAgent();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const status = await monitoringService.getMonitoringStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const getIntegrityReport = async (req, res, next) => {
  try {
    const report = await globalEventIntegrityValidator.generateIntegrityReport();
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
