import * as recoveryLinkService from './recoveryLinkService.js';
import * as emailService from './emailService.js';
import * as notificationService from './notificationService.js';
import * as couponService from './couponService.js';
import { sendDirectCellularSMS } from './smsService.js';
import RecoveryEvent from '../models/RecoveryEvent.js';
import * as agentLogService from './agentLogService.js';
import mongoose from 'mongoose';

/**
 * Extensible Recovery Workflow Rule Class
 */
export class RecoveryWorkflowRule {
  constructor({ id, name, priority = 50, condition, execute }) {
    this.id = id;
    this.name = name;
    this.priority = priority;
    this.condition = condition;
    this.execute = execute;
  }
}

/**
 * Recovery Workflow Engine Service
 */
export class RecoveryWorkflowEngine {
  constructor() {
    this.rules = [];
    this.initializeDefaultRules();
  }

  registerRule(rule) {
    if (!(rule instanceof RecoveryWorkflowRule)) {
      rule = new RecoveryWorkflowRule(rule);
    }
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  initializeDefaultRules() {
    // Rule 1: IF CART_ABANDONED -> Generate Recovery Link -> Send Email (Priority: 80)
    this.registerRule({
      id: 'RULE_WORKFLOW_CART_ABANDONED',
      name: 'Cart Abandoned Workflow',
      priority: 80,
      condition: (evt) => evt.eventType === 'CART_ABANDONED',
      execute: async (evt) => {
        const stepsExecuted = [];

        // Step A: Generate Recovery Link
        const linkResult = await recoveryLinkService.generateRecoveryLink(
          evt.userId,
          evt.relatedCartId,
          { recoveryAmount: evt.riskAmount || 0 }
        );
        stepsExecuted.push(`Generated Recovery Link: ${linkResult.recoveryLink}`);

        // Step B: Send Cellular SMS directly to registered phone number
        const customerName = evt.userName || evt.name || 'Valued Customer';
        const smsResult = await sendDirectCellularSMS({
          userId: evt.userId,
          message: `ReviveX Recovery: Hi ${customerName}, items ($${(evt.riskAmount || 0).toFixed(2)}) are waiting in your cart. Complete checkout: ${linkResult.recoveryLink}`,
        });
        stepsExecuted.push(`Dispatched Cellular SMS to customer phone: ${smsResult.phone}`);

        return {
          actionType: 'SMS',
          details: {
            recoveryLink: linkResult.recoveryLink,
            phone: smsResult.phone,
            smsDispatched: smsResult.smsDispatched,
            gatewayUsed: smsResult.gatewayUsed,
            stepsExecuted,
          },
        };
      },
    });

    // Rule 2: IF PAYMENT_FAILED -> Retry Payment -> Send Notification (Priority: 90)
    this.registerRule({
      id: 'RULE_WORKFLOW_PAYMENT_FAILED',
      name: 'Payment Failed Workflow',
      priority: 90,
      condition: (evt) => evt.eventType === 'PAYMENT_FAILED',
      execute: async (evt) => {
        const stepsExecuted = [];

        // Step A: Retry Payment (Generate 1-Click Retry URL)
        const linkResult = await recoveryLinkService.generateRecoveryLink(
          evt.userId,
          evt.relatedCartId,
          { recoveryAmount: evt.riskAmount || 0, expiresInHours: 1 }
        );
        stepsExecuted.push(`Initiated 1-Click Payment Retry Link: ${linkResult.recoveryLink}`);

        // Step B: Send Notification (In-App / Browser)
        const validUserId = evt.userId && mongoose.Types.ObjectId.isValid(evt.userId) ? evt.userId : null;
        if (validUserId) {
          await notificationService.sendNotification({
            userId: validUserId,
            category: 'PAYMENT_FAILED',
            type: 'IN_APP',
            variables: {
              customerName: evt.userName || 'Customer',
              recoveryLink: linkResult.recoveryLink,
            },
          });
          stepsExecuted.push(`Dispatched PAYMENT_FAILED In-App Notification to User ${validUserId}`);
        }

        return {
          actionType: 'RECOVERY_LINK',
          details: {
            retryUrl: linkResult.recoveryLink,
            notificationSent: !!validUserId,
            stepsExecuted,
          },
        };
      },
    });

    // Rule 3: IF HIGH_RISK_CUSTOMER -> Generate Coupon -> Send Email (Priority: 100)
    this.registerRule({
      id: 'RULE_WORKFLOW_HIGH_RISK_CUSTOMER',
      name: 'High Risk Customer Recovery Workflow',
      priority: 100,
      condition: (evt) => {
        const isHighRisk = evt.riskLevel === 'HIGH' || evt.riskLevel === 'CRITICAL' || (evt.riskScore && evt.riskScore >= 75);
        const isHighValue = (evt.riskAmount || 0) >= 150 || evt.isHighRiskCustomer;
        return isHighRisk || isHighValue;
      },
      execute: async (evt) => {
        const stepsExecuted = [];

        // Step A: Generate Coupon based on Risk Score rules (<50 -> 5%, 50-80 -> 10%, >80 -> 20%)
        const couponResult = await couponService.generateCoupon({
          riskScore: evt.riskScore || 85,
          userId: evt.userId,
          riskEventId: evt.riskEventId || evt._id,
        });
        stepsExecuted.push(`Generated ${couponResult.discountPercentage}% Discount Coupon: ${couponResult.couponCode}`);

        // Step B: Generate Recovery Link
        const linkResult = await recoveryLinkService.generateRecoveryLink(
          evt.userId,
          evt.relatedCartId,
          { recoveryAmount: evt.riskAmount || 0 }
        );

        // Step C: Send Email with Coupon Offer
        const recipientEmail = evt.userEmail || evt.email || 'customer@example.com';
        const customerName = evt.userName || evt.name || 'VIP Customer';

        await emailService.sendEmailWithRetry({
          to: recipientEmail,
          templateName: 'COUPON_OFFER',
          variables: {
            customerName,
            recoveryLink: linkResult.recoveryLink,
            couponCode: couponResult.couponCode,
            discountPercentage: couponResult.discountPercentage,
          },
        });
        stepsExecuted.push(`Sent COUPON_OFFER email to ${recipientEmail}`);

        return {
          actionType: 'COUPON',
          details: {
            couponCode: couponResult.couponCode,
            discountPercentage: couponResult.discountPercentage,
            recoveryLink: linkResult.recoveryLink,
            emailSentTo: recipientEmail,
            stepsExecuted,
          },
        };
      },
    });
  }

  /**
   * Execute Recovery Workflow for an incoming event
   */
  async executeWorkflow(eventData) {
    const startTime = Date.now();
    let matchedRule = null;

    for (const rule of this.rules) {
      if (rule.condition(eventData)) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return {
        executed: false,
        message: `No matching recovery workflow rule for event type ${eventData.eventType}`,
      };
    }

    console.log(`[RecoveryWorkflowEngine] Executing Rule '${matchedRule.name}' (${matchedRule.id})`);

    // Audit Logging: Received
    await agentLogService.createAgentLog({
      agentName: 'RecoveryWorkflowEngine',
      eventType: `WORKFLOW_START_${matchedRule.id}`,
      status: 'PROCESSING',
      message: `Started executing workflow '${matchedRule.name}'`,
      processedAt: new Date(),
    });

    try {
      const outcome = await matchedRule.execute(eventData);
      const durationMs = Date.now() - startTime;

      // Save RecoveryEvent Document
      const recoveryDoc = new RecoveryEvent({
        userId: eventData.userId && mongoose.Types.ObjectId.isValid(eventData.userId) ? eventData.userId : null,
        riskEventId: eventData.riskEventId && mongoose.Types.ObjectId.isValid(eventData.riskEventId) ? eventData.riskEventId : null,
        decisionId: eventData.decisionId && mongoose.Types.ObjectId.isValid(eventData.decisionId) ? eventData.decisionId : null,
        actionType: outcome.actionType || 'EMAIL',
        status: 'COMPLETED',
        recoveryAmount: eventData.riskAmount || 0,
        details: outcome.details || {},
        executedAt: new Date(),
      });
      await recoveryDoc.save();

      // Audit Logging: Completed
      await agentLogService.createAgentLog({
        agentName: 'RecoveryWorkflowEngine',
        eventType: `WORKFLOW_COMPLETE_${matchedRule.id}`,
        status: 'COMPLETED',
        message: `Successfully executed workflow '${matchedRule.name}' in ${durationMs}ms`,
        processedAt: new Date(),
      });

      return {
        executed: true,
        ruleId: matchedRule.id,
        ruleName: matchedRule.name,
        recoveryEvent: recoveryDoc,
        outcome,
        durationMs,
      };
    } catch (error) {
      console.error(`[RecoveryWorkflowEngine] Error executing workflow '${matchedRule.name}':`, error.message);

      await agentLogService.createAgentLog({
        agentName: 'RecoveryWorkflowEngine',
        eventType: `WORKFLOW_FAILED_${matchedRule.id}`,
        status: 'FAILED',
        message: `Error executing workflow '${matchedRule.name}': ${error.message}`,
        processedAt: new Date(),
      });

      throw error;
    }
  }
}

// Global Singleton Instance
export const globalRecoveryWorkflowEngine = new RecoveryWorkflowEngine();
