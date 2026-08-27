import * as abandonmentService from '../services/cartAbandonmentService.js';

export const runDetection = async (req, res, next) => {
  try {
    const { minutes } = req.body;
    const minutesOverride = minutes ? parseInt(minutes, 10) : null;
    const result = await abandonmentService.detectAbandonedCarts(minutesOverride);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const startJob = async (req, res, next) => {
  try {
    const { intervalMinutes } = req.body;
    const minutes = intervalMinutes ? parseInt(intervalMinutes, 10) : 10;
    const result = abandonmentService.startAbandonmentDetectorJob(minutes);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const stopJob = async (req, res, next) => {
  try {
    const result = abandonmentService.stopAbandonmentDetectorJob();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req, res, next) => {
  try {
    const status = abandonmentService.getAbandonmentDetectorStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
