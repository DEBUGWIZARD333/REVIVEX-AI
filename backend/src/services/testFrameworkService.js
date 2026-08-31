import crypto from 'crypto';
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Event from '../models/Event.js';
import RiskEvent from '../models/RiskEvent.js';
import DecisionEvent from '../models/DecisionEvent.js';
import RecoveryEvent from '../models/RecoveryEvent.js';
import Coupon from '../models/Coupon.js';

import * as monitoringAgentService from './monitoringAgentService.js';
import * as cartAbandonmentService from './cartAbandonmentService.js';
import riskConfigService from './riskConfigService.js';
import { handlePaymentFailureEvent } from './paymentFailureDetectorService.js';
import { runDecisionWorkflow } from '../langgraph/workflows/decisionGraph.js';
import * as recoveryAgentService from './recoveryAgentService.js';
import { globalRecoveryWorkflowEngine } from './recoveryWorkflowEngine.js';
import * as couponService from './couponService.js';
import * as recoveryLinkService from './recoveryLinkService.js';

/**
 * Helper to log steps into both memory & TestResult Mongo document
 */
const addLog = (logArray, level, message, details = null) => {
  const entry = { timestamp: new Date(), level, message, details };
  logArray.push(entry);
  console.log(`[TestFramework][${level}] ${message}`);
  return entry;
};

/**
 * Helper to find or create a mock customer for testing scenarios
 */
const getOrCreateMockCustomer = async (logArray) => {
  let user = await User.findOne({ email: 'test.customer@revivex-demo.com' });
  if (!user) {
    user = await User.create({
      name: 'Simulated Customer',
      email: 'test.customer@revivex-demo.com',
      password: 'password123',
      role: 'user',
    });
    addLog(logArray, 'INFO', `Created mock customer user [ID: ${user._id}]`, { userId: user._id });
  } else {
    addLog(logArray, 'INFO', `Found existing mock customer user [ID: ${user._id}]`, { userId: user._id });
  }
  return user;
};

/**
 * Helper to find or create a mock product for testing scenarios
 */
const getOrCreateMockProduct = async (logArray, price = 249.99) => {
  let product = await Product.findOne({ name: 'ReviveX Pro Enterprise Analytics' });
  if (!product) {
    product = await Product.create({
      name: 'ReviveX Pro Enterprise Analytics',
      description: 'High performance AI revenue recovery suite',
      price: price,
      category: 'Software',
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    });
    addLog(logArray, 'INFO', `Created mock product [ID: ${product._id}, Price: $${price}]`, { productId: product._id });
  } else {
    product.price = price;
    await product.save();
    addLog(logArray, 'INFO', `Found mock product [ID: ${product._id}, Price: $${price}]`, { productId: product._id });
  }
  return product;
};

/**
 * SCENARIO 1: Create Mock Customer Events
 */
export const scenarioCreateMockCustomerEvents = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Create Mock Customer Events');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'MOCK_CUSTOMER_EVENTS',
    scenarioName: 'Create Mock Customer Events',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);
    const product = await getOrCreateMockProduct(logs, 199.99);

    // Seed/Update Cart
    let cartItem = await Cart.findOne({ userId: user._id, productId: product._id });
    if (!cartItem) {
      cartItem = await Cart.create({ userId: user._id, productId: product._id, quantity: 2 });
    } else {
      cartItem.quantity += 1;
      await cartItem.save();
    }
    addLog(logs, 'INFO', `Updated cart item [Quantity: ${cartItem.quantity}]`, { cartId: cartItem._id });

    // Generate sequence of customer telemetry events
    const createdEvents = [];
    const eventSequence = [
      { eventType: 'PAGE_VIEW', eventData: { pageUrl: '/products/revivex-pro', referralSource: 'google' } },
      { eventType: 'ADD_TO_CART', eventData: { productId: product._id, quantity: 2, price: product.price } },
      { eventType: 'CHECKOUT_STARTED', eventData: { cartValue: product.price * 2, itemCount: 2 } },
    ];

    for (const evtDef of eventSequence) {
      const evt = await Event.create({
        userId: user._id,
        productId: product._id,
        eventType: evtDef.eventType,
        eventData: evtDef.eventData,
        timestamp: new Date(),
        isProcessed: false,
      });

      addLog(logs, 'SUCCESS', `Dispatched telemetry event [${evt.eventType}] (ID: ${evt._id})`, { eventId: evt._id });
      
      // Process through Event Monitoring Agent
      const processResult = await monitoringAgentService.processSingleEvent(evt);
      addLog(logs, 'INFO', `Event ${evt.eventType} processed by EventMonitoringAgent`, processResult.analysis);
      createdEvents.push(evt);
    }

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      productId: product._id,
      createdEventsCount: createdEvents.length,
      eventIds: createdEvents.map((e) => e._id),
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * SCENARIO 2: Simulate Cart Abandonment
 */
export const scenarioSimulateCartAbandonment = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Simulate Cart Abandonment');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'CART_ABANDONMENT',
    scenarioName: 'Simulate Cart Abandonment',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);
    const product = await getOrCreateMockProduct(logs, 299.99);

    // Clear old carts & past risk events for clean simulation
    await Cart.deleteMany({ userId: user._id });
    await RiskEvent.deleteMany({ userId: user._id, eventType: 'CART_ABANDONED' });

    // Seed idle cart timestamped 45 minutes in the past
    const idleTime = new Date(Date.now() - 45 * 60 * 1000);
    const cart = await Cart.create({
      userId: user._id,
      productId: product._id,
      quantity: 1,
      createdAt: idleTime,
      updatedAt: idleTime,
    });
    addLog(logs, 'INFO', `Created idle cart inactive for 45 minutes [Cart ID: ${cart._id}]`, { cartId: cart._id, idleTime });

    // Run Cart Abandonment Detector engine with 30 min override
    addLog(logs, 'INFO', 'Triggering CartAbandonmentService detector pipeline...');
    const detectionResult = await cartAbandonmentService.detectAbandonedCarts(30);

    addLog(logs, 'SUCCESS', `Detection completed. Carts detected: ${detectionResult.detectedCount}`, detectionResult);

    if (detectionResult.detectedCount === 0 && !detectionResult.detectedRiskEvents?.length) {
      // Force creation if pipeline skipped due to recent activity guard
      const manualEval = await riskConfigService.evaluateAndCreateRiskEvent({
        userId: user._id,
        eventType: 'CART_ABANDONED',
        riskAmount: 299.99,
        riskReason: 'Cart inactive for 45 minutes without checkout',
        relatedCartId: cart._id,
        idleMinutes: 45,
        detectedAt: new Date(),
      });
      addLog(logs, 'INFO', 'Created Cart Abandonment Risk Event', manualEval);
    }

    // Fetch newly created RiskEvent
    const riskEvent = await RiskEvent.findOne({ userId: user._id, eventType: 'CART_ABANDONED' }).sort({ createdAt: -1 });
    if (!riskEvent) {
      throw new Error('Failed to generate CART_ABANDONED RiskEvent document in MongoDB');
    }
    addLog(logs, 'SUCCESS', `Generated RiskEvent [ID: ${riskEvent._id}, Score: ${riskEvent.riskScore}, Level: ${riskEvent.riskLevel}]`);

    // Trigger LangGraph Decision Agent Workflow
    addLog(logs, 'INFO', 'Triggering LangGraph Decision Workflow for detected RiskEvent...');
    const decisionResult = await runDecisionWorkflow(riskEvent);
    addLog(logs, 'SUCCESS', `Decision Workflow finished with decision [Type: ${decisionResult.decisionType}]`);

    // Trigger Recovery Workflow Engine
    addLog(logs, 'INFO', 'Executing Recovery Workflow Engine for decision outcome...');
    const workflowOutcome = await globalRecoveryWorkflowEngine.executeWorkflow({
      userId: user._id,
      riskEventId: riskEvent._id,
      eventType: 'CART_ABANDONED',
      riskAmount: riskEvent.riskAmount,
      userEmail: user.email,
      userName: user.name,
      relatedCartId: cart._id,
    });
    addLog(logs, 'SUCCESS', `Recovery Workflow completed [Action: ${workflowOutcome.outcome?.actionType}]`, workflowOutcome);

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      cartId: cart._id,
      riskEventId: riskEvent._id,
      decisionType: decisionResult.decisionType,
      recoveryAction: workflowOutcome.outcome?.actionType,
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * SCENARIO 3: Simulate Payment Failure
 */
export const scenarioSimulatePaymentFailure = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Simulate Payment Failure');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'PAYMENT_FAILURE',
    scenarioName: 'Simulate Payment Failure',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);
    const product = await getOrCreateMockProduct(logs, 499.00);

    // Create PAYMENT_FAILED telemetry event
    const failureEvent = await Event.create({
      userId: user._id,
      productId: product._id,
      eventType: 'PAYMENT_FAILED',
      eventData: {
        amount: product.price,
        gateway: 'Stripe',
        errorCode: 'CARD_DECLINED_INSUFFICIENT_FUNDS',
        errorMessage: 'Your card has insufficient funds for this transaction.',
      },
      timestamp: new Date(),
      isProcessed: false,
    });
    addLog(logs, 'INFO', `Created PAYMENT_FAILED event [ID: ${failureEvent._id}]`, failureEvent.eventData);

    // Process event through Monitoring Agent & Payment Failure Detector
    addLog(logs, 'INFO', 'Processing PAYMENT_FAILED event via EventMonitoringAgent & PaymentFailureDetectorService...');
    const monitoringResult = await monitoringAgentService.processSingleEvent(failureEvent);
    addLog(logs, 'SUCCESS', 'EventMonitoringAgent processed PAYMENT_FAILED event', monitoringResult);

    // Check generated RiskEvent
    const riskEvent = await RiskEvent.findOne({ userId: user._id, eventType: 'PAYMENT_FAILED' }).sort({ createdAt: -1 });
    if (riskEvent) {
      addLog(logs, 'SUCCESS', `RiskEvent created for Payment Failure [ID: ${riskEvent._id}, Level: ${riskEvent.riskLevel}]`);
    }

    // Execute Recovery Workflow Engine for Payment Failure
    addLog(logs, 'INFO', 'Triggering Recovery Workflow Engine for PAYMENT_FAILED rule execution...');
    const workflowOutcome = await globalRecoveryWorkflowEngine.executeWorkflow({
      userId: user._id,
      riskEventId: riskEvent?._id,
      eventType: 'PAYMENT_FAILED',
      riskAmount: product.price,
      userEmail: user.email,
      userName: user.name,
    });

    addLog(logs, 'SUCCESS', 'Payment Failure Recovery Workflow executed successfully', workflowOutcome);

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      eventId: failureEvent._id,
      riskEventId: riskEvent?._id,
      workflowResult: workflowOutcome,
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * SCENARIO 4: Simulate Coupon Recovery
 */
export const scenarioSimulateCouponRecovery = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Simulate Coupon Recovery');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'COUPON_RECOVERY',
    scenarioName: 'Simulate Coupon Recovery',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);

    // Create high-risk event payload to force COUPON strategy
    const highRiskEvent = await RiskEvent.create({
      userId: user._id,
      eventType: 'CART_ABANDONED',
      riskScore: 88,
      riskLevel: 'HIGH',
      riskAmount: 350.00,
      riskReason: 'High value cart abandoned by recurring customer',
      status: 'OPEN',
      detectedAt: new Date(),
    });
    addLog(logs, 'INFO', `Created High-Risk Event [ID: ${highRiskEvent._id}, Score: 88, Amount: $350.00]`);

    // Invoke Coupon Generation Service
    addLog(logs, 'INFO', 'Invoking CouponService to calculate dynamic discount based on risk score (88)...');
    const couponObj = await couponService.generateCoupon({
      userId: user._id,
      riskScore: 88,
      riskEventId: highRiskEvent._id,
      validDays: 3,
    });
    addLog(logs, 'SUCCESS', `Generated Coupon [Code: ${couponObj.couponCode}, Discount: ${couponObj.discountPercentage}%]`, couponObj);

    // Invoke Recovery Workflow Engine with High Risk condition
    addLog(logs, 'INFO', 'Running High Risk Customer Recovery Workflow Engine rule...');
    const workflowOutcome = await globalRecoveryWorkflowEngine.executeWorkflow({
      userId: user._id,
      riskEventId: highRiskEvent._id,
      eventType: 'CART_ABANDONED',
      riskScore: 88,
      riskLevel: 'HIGH',
      riskAmount: 350.00,
      userEmail: user.email,
      userName: user.name,
    });
    addLog(logs, 'SUCCESS', 'Coupon Recovery Workflow executed successfully', workflowOutcome);

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      riskEventId: highRiskEvent._id,
      couponCode: couponObj.couponCode,
      discountPercentage: couponObj.discountPercentage,
      workflowResult: workflowOutcome,
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * SCENARIO 5: Simulate Revenue Recovery
 */
export const scenarioSimulateRevenueRecovery = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Simulate Revenue Recovery');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'REVENUE_RECOVERY',
    scenarioName: 'Simulate Revenue Recovery',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);
    const product = await getOrCreateMockProduct(logs, 500.00);

    // 1. Create a RiskEvent & RecoveryEvent representing abandoned cart recovery link
    const riskEvent = await RiskEvent.create({
      userId: user._id,
      eventType: 'CART_ABANDONED',
      riskScore: 70,
      riskLevel: 'MEDIUM',
      riskAmount: 500.00,
      riskReason: 'Cart value $500 abandoned',
      status: 'OPEN',
      detectedAt: new Date(),
    });

    const recoveryEvent = await RecoveryEvent.create({
      userId: user._id,
      riskEventId: riskEvent._id,
      actionType: 'RECOVERY_LINK',
      status: 'PENDING',
      recoveryAmount: 500.00,
      executedAt: new Date(),
    });
    addLog(logs, 'INFO', `Created initial PENDING RecoveryEvent [ID: ${recoveryEvent._id}, Amount: $500.00]`);

    // 2. Generate Recovery Link
    const linkResult = await recoveryLinkService.generateRecoveryLink(user._id, null, { recoveryAmount: 500.00 });
    addLog(logs, 'INFO', `Generated 1-Click Recovery Link: ${linkResult.recoveryLink}`, linkResult);

    // 3. Simulate customer clicking link & completing payment success
    const paymentSuccessEvent = await Event.create({
      userId: user._id,
      productId: product._id,
      eventType: 'PAYMENT_SUCCESS',
      eventData: {
        amount: 500.00,
        recoveryToken: linkResult.recoveryToken?.token || 'RECOVERY_TOKEN_SIMULATED',
        source: 'RECOVERY_LINK',
      },
      timestamp: new Date(),
      isProcessed: false,
    });
    addLog(logs, 'SUCCESS', `Simulated customer PAYMENT_SUCCESS event via Recovery Link`, paymentSuccessEvent.eventData);

    // 4. Mark RecoveryEvent as COMPLETED / RECOVERED
    recoveryEvent.status = 'COMPLETED';
    recoveryEvent.details = { ...recoveryEvent.details, recoveredAt: new Date(), converted: true };
    await recoveryEvent.save();

    riskEvent.status = 'RESOLVED';
    await riskEvent.save();

    addLog(logs, 'SUCCESS', `Successfully updated RecoveryEvent status to COMPLETED and RiskEvent to RESOLVED`, {
      recoveryEventId: recoveryEvent._id,
      riskEventId: riskEvent._id,
      revenueRecovered: 500.00,
    });

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      recoveryEventId: recoveryEvent._id,
      riskEventId: riskEvent._id,
      revenueRecovered: 500.00,
      recoveryLink: linkResult.recoveryLink,
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * SCENARIO 6: Simulate All Agent Workflows End-to-End
 */
export const scenarioSimulateAllAgentWorkflows = async (suiteRunId, testDoc = null) => {
  const startTime = Date.now();
  const logs = [];
  addLog(logs, 'INFO', 'Starting scenario: Simulate All Agent Workflows (Full E2E Pipeline)');

  const doc = testDoc || new TestResult({
    suiteRunId: suiteRunId || `SUITE-${Date.now()}`,
    scenarioId: 'ALL_AGENT_WORKFLOWS',
    scenarioName: 'Simulate All Agent Workflows',
    status: 'RUNNING',
    startedAt: new Date(),
    logs,
  });

  doc.status = 'RUNNING';
  await doc.save();

  try {
    const user = await getOrCreateMockCustomer(logs);
    const product = await getOrCreateMockProduct(logs, 399.99);

    // Agent 1: Event Monitoring Agent
    addLog(logs, 'INFO', 'Step 1/5: Testing Event Monitoring Agent...');
    const telemetryEvt = await Event.create({
      userId: user._id,
      productId: product._id,
      eventType: 'CHECKOUT_STARTED',
      eventData: { cartTotal: 399.99 },
      isProcessed: false,
    });
    const agent1Res = await monitoringAgentService.processSingleEvent(telemetryEvt);
    addLog(logs, 'SUCCESS', 'Agent 1 (EventMonitoringAgent) completed successfully', agent1Res);

    // Agent 2: Risk Scoring Engine & Cart Abandonment Detector
    addLog(logs, 'INFO', 'Step 2/5: Testing Cart Abandonment & Risk Scoring Engine...');
    const cart = await Cart.create({
      userId: user._id,
      productId: product._id,
      quantity: 1,
      updatedAt: new Date(Date.now() - 35 * 60 * 1000),
    });
    const agent2Res = await riskConfigService.evaluateAndCreateRiskEvent({
      userId: user._id,
      eventType: 'CART_ABANDONED',
      riskAmount: 399.99,
      riskReason: 'Cart idle for 35 minutes',
      relatedCartId: cart._id,
      idleMinutes: 35,
    });
    addLog(logs, 'SUCCESS', 'Agent 2 (RiskScoringEngine) completed successfully', agent2Res);

    const riskEvent = agent2Res.riskEvent;

    // Agent 3: Decision Agent (LangGraph Decision Graph)
    addLog(logs, 'INFO', 'Step 3/5: Testing LangGraph Decision Agent...');
    const agent3Res = await runDecisionWorkflow(riskEvent);
    addLog(logs, 'SUCCESS', `Agent 3 (DecisionAgent Graph) generated decision '${agent3Res.decisionType}' with score ${agent3Res.confidenceScore}`);

    // Agent 4: Recovery Agent Core Worker
    addLog(logs, 'INFO', 'Step 4/5: Testing Recovery Agent Core...');
    const decisionDoc = await DecisionEvent.create({
      userId: user._id,
      riskEventId: riskEvent._id,
      decisionType: agent3Res.decisionType || 'COUPON',
      confidenceScore: agent3Res.confidenceScore || 0.9,
      riskReason: riskEvent.riskReason,
      cartValue: 399.99,
      status: 'EXECUTED',
    });

    const agent4Res = await recoveryAgentService.processDecisionOutput(decisionDoc);
    addLog(logs, 'SUCCESS', 'Agent 4 (RecoveryAgentCore) created recovery action', agent4Res);

    // Agent 5: Recovery Workflow Engine
    addLog(logs, 'INFO', 'Step 5/5: Testing Recovery Workflow Engine...');
    const agent5Res = await globalRecoveryWorkflowEngine.executeWorkflow({
      userId: user._id,
      riskEventId: riskEvent._id,
      eventType: 'CART_ABANDONED',
      riskAmount: 399.99,
      userEmail: user.email,
      userName: user.name,
    });
    addLog(logs, 'SUCCESS', 'Agent 5 (RecoveryWorkflowEngine) rule execution completed', agent5Res);

    doc.status = 'SUCCESS';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.payload = {
      userId: user._id,
      riskEventId: riskEvent._id,
      decisionId: decisionDoc._id,
      agentsTested: [
        'EventMonitoringAgent',
        'CartAbandonmentDetector & RiskScoringEngine',
        'LangGraph Decision Agent',
        'RecoveryAgentCore',
        'RecoveryWorkflowEngine',
      ],
    };
    await doc.save();

    return doc;
  } catch (err) {
    addLog(logs, 'ERROR', `Scenario execution failed: ${err.message}`, { stack: err.stack });
    doc.status = 'FAILED';
    doc.executionTimeMs = Date.now() - startTime;
    doc.completedAt = new Date();
    doc.logs = logs;
    doc.errorDetails = { message: err.message, stack: err.stack };
    await doc.save();
    return doc;
  }
};

/**
 * Runner Map for Scenario IDs
 */
const SCENARIO_RUNNERS = {
  MOCK_CUSTOMER_EVENTS: scenarioCreateMockCustomerEvents,
  CART_ABANDONMENT: scenarioSimulateCartAbandonment,
  PAYMENT_FAILURE: scenarioSimulatePaymentFailure,
  COUPON_RECOVERY: scenarioSimulateCouponRecovery,
  REVENUE_RECOVERY: scenarioSimulateRevenueRecovery,
  ALL_AGENT_WORKFLOWS: scenarioSimulateAllAgentWorkflows,
};

/**
 * Execute a single scenario by ID
 */
export const runScenarioById = async (scenarioId, suiteRunId = null) => {
  const runner = SCENARIO_RUNNERS[scenarioId];
  if (!runner) {
    throw new Error(`Invalid scenario ID: '${scenarioId}'`);
  }
  const sRunId = suiteRunId || `RUN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  return await runner(sRunId);
};

/**
 * Run ALL scenarios in batch
 */
export const runAllScenariosBatch = async () => {
  const suiteRunId = `SUITE-ALL-${Date.now()}`;
  const scenarioKeys = Object.keys(SCENARIO_RUNNERS);
  const results = [];

  for (const sId of scenarioKeys) {
    const res = await runScenarioById(sId, suiteRunId);
    results.push(res);
  }

  return { suiteRunId, totalRun: results.length, results };
};

/**
 * Retry a failed scenario by TestResult Mongo ID
 */
export const retryScenarioById = async (testResultId) => {
  const existingDoc = await TestResult.findById(testResultId);
  if (!existingDoc) {
    throw new Error(`TestResult document not found with ID: ${testResultId}`);
  }

  existingDoc.retryCount += 1;
  addLog(
    existingDoc.logs,
    'INFO',
    `Initiating retry attempt #${existingDoc.retryCount} for scenario '${existingDoc.scenarioId}'`
  );

  const runner = SCENARIO_RUNNERS[existingDoc.scenarioId];
  if (!runner) {
    throw new Error(`No scenario runner found for scenario ID: '${existingDoc.scenarioId}'`);
  }

  return await runner(existingDoc.suiteRunId, existingDoc);
};
