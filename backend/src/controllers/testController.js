import TestResult from '../models/TestResult.js';
import * as testFrameworkService from '../services/testFrameworkService.js';

/**
 * @desc    Run test scenario (single or all)
 * @route   POST /api/testing/run-scenario
 * @access  Public / Protected
 */
export const runScenario = async (req, res, next) => {
  try {
    const { scenarioId } = req.body;

    if (!scenarioId || scenarioId === 'ALL') {
      const batchResults = await testFrameworkService.runAllScenariosBatch();
      return res.status(200).json({
        success: true,
        message: 'Executed all test scenarios batch successfully',
        data: batchResults,
      });
    }

    const testResult = await testFrameworkService.runScenarioById(scenarioId);

    return res.status(200).json({
      success: true,
      message: `Executed scenario '${scenarioId}' successfully`,
      data: testResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retry a failed scenario
 * @route   POST /api/testing/retry/:id
 * @access  Public / Protected
 */
export const retryScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTestResult = await testFrameworkService.retryScenarioById(id);

    return res.status(200).json({
      success: true,
      message: `Retried scenario '${updatedTestResult.scenarioId}' (Attempt #${updatedTestResult.retryCount})`,
      data: updatedTestResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get test results with pagination, filters, and summary metrics
 * @route   GET /api/testing/results
 * @access  Public / Protected
 */
export const getTestResults = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status;
    const scenarioFilter = req.query.scenarioId;

    const query = {};
    if (statusFilter) query.status = statusFilter;
    if (scenarioFilter) query.scenarioId = scenarioFilter;

    const total = await TestResult.countDocuments(query);
    const results = await TestResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate aggregated metrics
    const totalAll = await TestResult.countDocuments({});
    const successCount = await TestResult.countDocuments({ status: 'SUCCESS' });
    const failedCount = await TestResult.countDocuments({ status: 'FAILED' });
    const runningCount = await TestResult.countDocuments({ status: 'RUNNING' });

    const avgTimeAgg = await TestResult.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, avgTime: { $avg: '$executionTimeMs' } } },
    ]);
    const avgExecutionTimeMs = Math.round(avgTimeAgg[0]?.avgTime || 0);

    const successRate = totalAll > 0 ? parseFloat(((successCount / totalAll) * 100).toFixed(1)) : 100.0;

    return res.status(200).json({
      success: true,
      metrics: {
        totalTests: totalAll,
        successCount,
        failedCount,
        runningCount,
        successRate,
        avgExecutionTimeMs,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single test result detail by ID
 * @route   GET /api/testing/results/:id
 * @access  Public / Protected
 */
export const getTestResultById = async (req, res, next) => {
  try {
    const result = await TestResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Test result not found' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear test results history
 * @route   DELETE /api/testing/results
 * @access  Public / Protected
 */
export const clearTestResults = async (req, res, next) => {
  try {
    await TestResult.deleteMany({});
    return res.status(200).json({ success: true, message: 'Cleared all test result records' });
  } catch (error) {
    next(error);
  }
};
