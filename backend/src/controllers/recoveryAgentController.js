import * as recoveryAgentService from '../services/recoveryAgentService.js';

export const processDecision = async (req, res, next) => {
  try {
    const result = await recoveryAgentService.processDecisionOutput(req.body);
    res.status(201).json({
      success: true,
      message: 'Decision output processed into RecoveryEvent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const status = recoveryAgentService.getRecoveryAgentStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const startWorker = async (req, res, next) => {
  try {
    const { intervalMs } = req.body;
    const result = recoveryAgentService.startRecoveryAgentWorker(intervalMs || 10000);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const stopWorker = async (req, res, next) => {
  try {
    const result = recoveryAgentService.stopRecoveryAgentWorker();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
