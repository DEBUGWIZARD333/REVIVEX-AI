import { globalRecoveryWorkflowEngine } from '../services/recoveryWorkflowEngine.js';

export const executeWorkflow = async (req, res, next) => {
  try {
    const result = await globalRecoveryWorkflowEngine.executeWorkflow(req.body);
    res.status(200).json({
      success: true,
      message: result.executed ? 'Recovery workflow executed successfully' : result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRules = async (req, res, next) => {
  try {
    const rules = globalRecoveryWorkflowEngine.rules.map((r) => ({
      id: r.id,
      name: r.name,
      priority: r.priority,
    }));

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};
