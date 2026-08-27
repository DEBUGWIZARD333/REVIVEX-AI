import riskConfigService from '../services/riskConfigService.js';

export const getRiskConfig = async (req, res, next) => {
  try {
    const config = riskConfigService.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRiskConfig = async (req, res, next) => {
  try {
    const updatedConfig = riskConfigService.updateConfig(req.body);
    res.json({
      success: true,
      message: 'Risk configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateEventRisk = async (req, res, next) => {
  try {
    const result = await riskConfigService.evaluateAndCreateRiskEvent(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
