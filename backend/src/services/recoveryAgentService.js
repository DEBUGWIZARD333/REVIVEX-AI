import RecoveryEvent from '../models/RecoveryEvent.js';
import DecisionEvent from '../models/DecisionEvent.js';
import * as agentLogService from './agentLogService.js';
import { sendWhatsAppRecoveryNotification } from './whatsappService.js';
import { sendDirectCellularSMS } from './smsService.js';
import { sendNotification } from './notificationService.js';

const AGENT_NAME = 'RecoveryAgentCore';
let isWorkerRunning = false;
let workerIntervalId = null;
let processedRecoveryCount = 0;

/**
 * 1. Action Type Mapper: Maps Decision Agent decision types to Recovery Action Types
 */
export const mapDecisionToActionType = (decisionType) => {
  switch (decisionType) {
    case 'COUPON':
    case 'REMINDER':
    case 'SMS':
      return 'SMS';
    case 'WHATSAPP':
      return 'WHATSAPP';
    case 'RETRY_PAYMENT':
      return 'RECOVERY_LINK';
    default:
      return 'SMS';
  }
};

/**
 * 2. Action Executors (Modular Service Handlers)
 */
export const executeRecoveryAction = async (actionType, decisionData) => {
  const cartValue = decisionData.cartValue || decisionData.riskAmount || 0;
  
  let targetUser = decisionData.userId;
  if (targetUser && typeof targetUser === 'string') {
    targetUser = await User.findById(targetUser);
  } else if (targetUser && targetUser._id && !targetUser.phone) {
    targetUser = await User.findById(targetUser._id);
  }

  const userEmail = targetUser?.email || decisionData.userEmail || 'customer@example.com';
  const userPhone = targetUser?.phone || decisionData.phone || '+918825553110';
  const customerName = targetUser?.name || decisionData.customerName || 'Valued Customer';

  switch (actionType) {
    case 'SMS': {
      const smsMsg = `ReviveX Recovery: Hi ${customerName}, you left items ($${cartValue.toFixed(2)}) in your cart. Checkout now: http://localhost:5173/checkout?recovery=true`;
      const smsResult = await sendDirectCellularSMS({
        userId: decisionData.userId?._id || decisionData.userId,
        phone: userPhone,
        message: smsMsg,
      });

      return {
        actionType: 'SMS',
        recoveryAmount: cartValue,
        details: {
          phone: smsResult.phone,
          message: smsMsg,
          smsDispatched: smsResult.smsDispatched,
          gatewayUsed: smsResult.gatewayUsed,
        },
      };
    }

    case 'WHATSAPP': {
      const waResult = await sendWhatsAppRecoveryNotification({
        userId: decisionData.userId?._id || decisionData.userId,
        phone: userPhone,
        customerName,
        eventType: decisionData.riskEventId?.eventType || 'CART_ABANDONED',
        amount: cartValue,
        recoveryLink: `http://localhost:5173/checkout?recovery=true`,
      });

      // Also trigger direct SMS
      await sendDirectCellularSMS({
        userId: decisionData.userId?._id || decisionData.userId,
        phone: userPhone,
        message: `ReviveX Cart Recovery: Hi ${customerName}, you left items ($${cartValue.toFixed(2)}) in your cart. Checkout: http://localhost:5173/checkout?recovery=true`,
      });

      // Dispatch in-app notification for customer UI
      if (decisionData.userId?._id || decisionData.userId) {
        try {
          await sendNotification({
            userId: decisionData.userId?._id || decisionData.userId,
            category: 'CART_ABANDONED',
            type: 'IN_APP',
            variables: {
              customerName,
              cartTotal: cartValue,
              recoveryLink: `http://localhost:5173/checkout?recovery=true`,
            },
          });
        } catch (e) {
          console.warn('[RecoveryAgentCore] Notification dispatch fallback:', e.message);
        }
      }

      return {
        actionType: 'WHATSAPP',
        recoveryAmount: cartValue,
        details: {
          phone: waResult.phone,
          whatsappWebUrl: waResult.whatsappWebUrl,
          text: waResult.text,
          message: `Dispatched WhatsApp text recovery to ${waResult.phone}`,
        },
      };
    }

    case 'COUPON': {
      const couponCode = `SAVE20-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        actionType: 'COUPON',
        recoveryAmount: cartValue,
        details: {
          couponCode,
          discountPercent: 20,
          validForHours: 48,
          message: `Issued 20% discount coupon [${couponCode}] for cart value $${cartValue.toFixed(2)}`,
        },
      };
    }

    case 'RECOVERY_LINK': {
      const sessionId = decisionData.riskEventId?._id || 'SESS-RECOVERY';
      const recoveryLink = `http://localhost:5173/checkout?recovery=true&session=${sessionId}`;
      return {
        actionType: 'RECOVERY_LINK',
        recoveryAmount: cartValue,
        details: {
          recoveryLink,
          gatewaySessionId: sessionId,
          oneClickCheckout: true,
          message: `Generated 1-click payment recovery link: ${recoveryLink}`,
        },
      };
    }

    case 'NOTIFICATION': {
      const ticketId = `VIP-REC-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        actionType: 'NOTIFICATION',
        recoveryAmount: cartValue,
        details: {
          ticketId,
          priority: 'HIGH_VIP_ESCALATION',
          channel: 'VIP_TELEMETRY_ALERT',
          message: `Dispatched VIP recovery notification ticket [${ticketId}] for cart value $${cartValue.toFixed(2)}`,
        },
      };
    }

    case 'EMAIL':
    default: {
      return {
        actionType: 'EMAIL',
        recoveryAmount: cartValue,
        details: {
          recipient: userEmail,
          template: 'cart_abandonment_recovery_reminder',
          subject: 'Your items are waiting in your cart!',
          message: `Queued friendly recovery email to ${userEmail}`,
        },
      };
    }
  }
};

/**
 * 3. Core Process Function (Service Pattern)
 * Responsibilities: Receive decision output -> Determine action -> Execute action -> Log results -> Update status
 */
export const processDecisionOutput = async (decisionData) => {
  const decisionId = decisionData._id || decisionData.decisionId;
  const userId = decisionData.userId?._id || decisionData.userId || null;
  const riskEventId = decisionData.riskEventId?._id || decisionData.riskEventId || null;
  const decisionType = decisionData.decisionType || 'REMINDER';

  // Step 3a: Write initial RECEIVED AgentLog
  await agentLogService.createAgentLog({
    agentName: AGENT_NAME,
    eventId: riskEventId,
    eventType: `RECOVERY_${decisionType}`,
    status: 'RECEIVED',
    message: `Received decision ${decisionType} for recovery processing`,
    processedAt: new Date(),
  });

  // Step 3b: Determine action & create initial PENDING RecoveryEvent doc
  const actionType = mapDecisionToActionType(decisionType);
  
  const recoveryDoc = new RecoveryEvent({
    userId,
    riskEventId,
    decisionId,
    actionType,
    status: 'PENDING',
    recoveryAmount: decisionData.cartValue || decisionData.riskAmount || 0,
    details: { decisionType },
    executedAt: new Date(),
  });
  await recoveryDoc.save();

  try {
    // Step 3c: Update AgentLog status to PROCESSING
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: riskEventId,
      eventType: `RECOVERY_${actionType}`,
      status: 'PROCESSING',
      message: `Executing recovery action ${actionType} for decision ${decisionId}`,
      processedAt: new Date(),
    });

    // Step 3d: Execute action handler
    const executionResult = await executeRecoveryAction(actionType, decisionData);

    // Step 3e: Update RecoveryEvent status to COMPLETED (or SENT)
    recoveryDoc.status = 'COMPLETED';
    recoveryDoc.recoveryAmount = executionResult.recoveryAmount || recoveryDoc.recoveryAmount;
    recoveryDoc.details = { ...recoveryDoc.details, ...executionResult.details };
    recoveryDoc.executedAt = new Date();
    await recoveryDoc.save();

    // Step 3f: Write COMPLETED AgentLog
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: riskEventId,
      eventType: `RECOVERY_${actionType}`,
      status: 'COMPLETED',
      message: executionResult.details?.message || `Successfully executed recovery action ${actionType}`,
      processedAt: new Date(),
    });

    processedRecoveryCount++;

    return {
      success: true,
      recoveryEvent: recoveryDoc,
    };
  } catch (error) {
    // Step 3g: Error Handling - Mark status as FAILED and log error
    recoveryDoc.status = 'FAILED';
    recoveryDoc.details = { ...recoveryDoc.details, error: error.message };
    await recoveryDoc.save();

    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: riskEventId,
      eventType: `RECOVERY_${actionType}`,
      status: 'FAILED',
      message: `Error executing recovery action: ${error.message}`,
      processedAt: new Date(),
    });

    throw error;
  }
};

/**
 * 4. Background Async Worker Polling Loop
 */
export const startRecoveryAgentWorker = (intervalMs = 10000) => {
  if (isWorkerRunning) {
    return { success: false, message: 'Recovery Agent Core worker is already running' };
  }

  isWorkerRunning = true;
  workerIntervalId = setInterval(async () => {
    try {
      // Find decisions that haven't been processed into a RecoveryEvent yet
      const processedDecisionIds = await RecoveryEvent.distinct('decisionId');
      const pendingDecisions = await DecisionEvent.find({
        _id: { $nin: processedDecisionIds },
      })
        .populate('userId')
        .populate('riskEventId')
        .limit(5);

      for (const decision of pendingDecisions) {
        await processDecisionOutput(decision);
      }
    } catch (err) {
      console.error('[RecoveryAgentCore] Worker error:', err.message);
    }
  }, intervalMs);

  console.log(`[RecoveryAgentCore] Started worker polling loop (every ${intervalMs}ms)`);
  return { success: true, message: `Recovery Agent Core worker started (interval: ${intervalMs}ms)` };
};

export const stopRecoveryAgentWorker = () => {
  if (!isWorkerRunning) {
    return { success: false, message: 'Recovery Agent Core worker is not running' };
  }

  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
  }
  isWorkerRunning = false;

  console.log('[RecoveryAgentCore] Stopped worker loop');
  return { success: true, message: 'Recovery Agent Core worker stopped' };
};

export const getRecoveryAgentStatus = () => {
  return {
    agentName: AGENT_NAME,
    isWorkerRunning,
    processedRecoveryCount,
  };
};
