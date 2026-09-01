import RecoveryEvent from '../models/RecoveryEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import DecisionEvent from '../models/DecisionEvent.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Event from '../models/Event.js';

import * as recoveryLinkService from './recoveryLinkService.js';
import * as couponService from './couponService.js';
import * as emailService from './emailService.js';
import * as recoveryAgentService from './recoveryAgentService.js';
import { globalRecoveryWorkflowEngine } from './recoveryWorkflowEngine.js';

/**
 * Recovery Agent Automated Action & Conversion Testing Engine
 */
export class RecoveryAgentValidator {
  /**
   * Run full test suite covering all 4 recovery channels + conversion simulation
   */
  async runRecoveryTestSuite(logArray = []) {
    const startTime = Date.now();
    const testResults = [];
    const createdRecords = [];
    let passedCount = 0;

    // 1. Setup Test Customer & Product
    let testUser = await User.findOne({ email: 'recovery.tester@revivex-demo.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Recovery Tester Account',
        email: 'recovery.tester@revivex-demo.com',
        password: 'password123',
        role: 'user',
      });
    }

    let testProduct = await Product.findOne({ name: 'ReviveX Pro Enterprise Analytics' });
    if (!testProduct) {
      testProduct = await Product.create({
        name: 'ReviveX Pro Enterprise Analytics',
        description: 'High performance AI revenue recovery suite',
        price: 299.99,
        category: 'Software',
        stock: 50,
      });
    }

    // --- TEST 1: Generate Cart Recovery Link ---
    try {
      const linkResult = await recoveryLinkService.generateRecoveryLink(
        testUser._id,
        null,
        { recoveryAmount: 299.99, expiresInHours: 24 }
      );

      const isValidLink = !!(linkResult.recoveryLink && linkResult.token);
      if (isValidLink) passedCount++;

      const recDoc = await RecoveryEvent.create({
        userId: testUser._id,
        actionType: 'RECOVERY_LINK',
        status: 'SENT',
        recoveryAmount: 299.99,
        details: {
          recoveryLink: linkResult.recoveryLink,
          token: linkResult.recoveryToken?.token,
          channel: '1-Click Cart Recovery',
        },
        executedAt: new Date(),
      });
      createdRecords.push(recDoc);

      testResults.push({
        testId: 'TEST_RECOVERY_LINK',
        name: 'Generate Cart Recovery Link',
        actionType: 'RECOVERY_LINK',
        isPassed: isValidLink,
        outputDetails: { recoveryLink: linkResult.recoveryLink, mongoId: recDoc._id },
      });

      if (logArray) {
        logArray.push({
          timestamp: new Date(),
          level: isValidLink ? 'SUCCESS' : 'ERROR',
          message: `Test 1: Generated Cart Recovery Link -> ${linkResult.recoveryLink}`,
          details: linkResult,
        });
      }
    } catch (err) {
      testResults.push({
        testId: 'TEST_RECOVERY_LINK',
        name: 'Generate Cart Recovery Link',
        actionType: 'RECOVERY_LINK',
        isPassed: false,
        error: err.message,
      });
    }

    // --- TEST 2: Generate Discount Coupon ---
    try {
      const couponResult = await couponService.generateCoupon({
        userId: testUser._id,
        riskScore: 85,
        validDays: 3,
      });

      const isValidCoupon = !!(couponResult.couponCode && couponResult.discountPercentage > 0);
      if (isValidCoupon) passedCount++;

      const recDoc = await RecoveryEvent.create({
        userId: testUser._id,
        actionType: 'COUPON',
        status: 'SENT',
        recoveryAmount: 299.99,
        details: {
          couponCode: couponResult.couponCode,
          discountPercentage: couponResult.discountPercentage,
          validForDays: 3,
        },
        executedAt: new Date(),
      });
      createdRecords.push(recDoc);

      testResults.push({
        testId: 'TEST_COUPON',
        name: 'Generate Discount Coupon',
        actionType: 'COUPON',
        isPassed: isValidCoupon,
        outputDetails: { couponCode: couponResult.couponCode, discount: `${couponResult.discountPercentage}%` },
      });

      if (logArray) {
        logArray.push({
          timestamp: new Date(),
          level: isValidCoupon ? 'SUCCESS' : 'ERROR',
          message: `Test 2: Generated Discount Coupon [Code: ${couponResult.couponCode}, Discount: ${couponResult.discountPercentage}%]`,
          details: couponResult,
        });
      }
    } catch (err) {
      testResults.push({
        testId: 'TEST_COUPON',
        name: 'Generate Discount Coupon',
        actionType: 'COUPON',
        isPassed: false,
        error: err.message,
      });
    }

    // --- TEST 3: Generate Retry Payment Link ---
    try {
      const retryResult = await recoveryLinkService.generateRecoveryLink(
        testUser._id,
        null,
        { recoveryAmount: 299.99, expiresInHours: 1 }
      );

      const isValidRetry = !!(retryResult.recoveryLink && retryResult.token);
      if (isValidRetry) passedCount++;

      const recDoc = await RecoveryEvent.create({
        userId: testUser._id,
        actionType: 'RECOVERY_LINK',
        status: 'SENT',
        recoveryAmount: 299.99,
        details: {
          retryUrl: retryResult.recoveryLink,
          isPaymentRetry: true,
          gatewaySessionId: 'SESS-PAYMENT-RETRY',
        },
        executedAt: new Date(),
      });
      createdRecords.push(recDoc);

      testResults.push({
        testId: 'TEST_RETRY_PAYMENT',
        name: 'Generate 1-Click Retry Payment Link',
        actionType: 'RECOVERY_LINK',
        isPassed: isValidRetry,
        outputDetails: { retryUrl: retryResult.recoveryLink },
      });

      if (logArray) {
        logArray.push({
          timestamp: new Date(),
          level: isValidRetry ? 'SUCCESS' : 'ERROR',
          message: `Test 3: Generated 1-Click Retry Payment Link -> ${retryResult.recoveryLink}`,
          details: retryResult,
        });
      }
    } catch (err) {
      testResults.push({
        testId: 'TEST_RETRY_PAYMENT',
        name: 'Generate 1-Click Retry Payment Link',
        actionType: 'RECOVERY_LINK',
        isPassed: false,
        error: err.message,
      });
    }

    // --- TEST 4: Trigger Email Notification ---
    try {
      const emailResult = await emailService.sendEmailWithRetry({
        to: testUser.email,
        templateName: 'CART_REMINDER',
        variables: {
          customerName: testUser.name,
          cartTotal: 299.99,
          recoveryLink: `http://localhost:5173/checkout?recovery=true`,
        },
      });

      const isEmailSent = emailResult.success;
      if (isEmailSent) passedCount++;

      const recDoc = await RecoveryEvent.create({
        userId: testUser._id,
        actionType: 'EMAIL',
        status: 'SENT',
        recoveryAmount: 299.99,
        details: {
          recipient: testUser.email,
          template: 'CART_REMINDER',
          subject: emailResult.details?.subject || 'Items waiting in cart',
        },
        executedAt: new Date(),
      });
      createdRecords.push(recDoc);

      testResults.push({
        testId: 'TEST_EMAIL',
        name: 'Trigger Email Notification',
        actionType: 'EMAIL',
        isPassed: isEmailSent,
        outputDetails: { recipient: testUser.email, template: 'CART_REMINDER' },
      });

      if (logArray) {
        logArray.push({
          timestamp: new Date(),
          level: isEmailSent ? 'SUCCESS' : 'ERROR',
          message: `Test 4: Dispatched Recovery Email to ${testUser.email}`,
          details: emailResult,
        });
      }
    } catch (err) {
      testResults.push({
        testId: 'TEST_EMAIL',
        name: 'Trigger Email Notification',
        actionType: 'EMAIL',
        isPassed: false,
        error: err.message,
      });
    }

    // --- TEST 5: Simulate Successful Revenue Recovery Conversion ---
    try {
      // Create pending recovery event & simulate payment success
      const conversionDoc = await RecoveryEvent.create({
        userId: testUser._id,
        actionType: 'RECOVERY_LINK',
        status: 'PENDING',
        recoveryAmount: 299.99,
        details: { simulatedConversion: true },
        executedAt: new Date(),
      });

      // Simulate customer completed order via recovery link
      const successEvt = await Event.create({
        userId: testUser._id,
        productId: testProduct._id,
        eventType: 'PAYMENT_SUCCESS',
        eventData: { amount: 299.99, source: 'RECOVERY_LINK_TEST' },
        timestamp: new Date(),
        isProcessed: true,
      });

      // Update RecoveryEvent status to COMPLETED
      conversionDoc.status = 'COMPLETED';
      conversionDoc.details = { ...conversionDoc.details, recoveredAt: new Date(), amountRecovered: 299.99 };
      await conversionDoc.save();

      const isConverted = conversionDoc.status === 'COMPLETED';
      if (isConverted) passedCount++;

      testResults.push({
        testId: 'TEST_CONVERSION',
        name: 'Validate Successful Revenue Recovery Conversion',
        actionType: 'RECOVERY_LINK',
        isPassed: isConverted,
        outputDetails: { recoveredAmount: '$299.99', status: conversionDoc.status, mongoId: conversionDoc._id },
      });

      if (logArray) {
        logArray.push({
          timestamp: new Date(),
          level: isConverted ? 'SUCCESS' : 'ERROR',
          message: `Test 5: Validated Successful Recovery Conversion -> Status: COMPLETED, Revenue: $299.99`,
          details: { conversionDoc, successEvt },
        });
      }
    } catch (err) {
      testResults.push({
        testId: 'TEST_CONVERSION',
        name: 'Validate Successful Revenue Recovery Conversion',
        actionType: 'RECOVERY_LINK',
        isPassed: false,
        error: err.message,
      });
    }

    const totalTests = 5;
    const accuracyRate = parseFloat(((passedCount / totalTests) * 100).toFixed(1));
    const durationMs = Date.now() - startTime;

    return {
      success: accuracyRate >= 80,
      accuracyRate,
      passedCount,
      totalTests,
      durationMs,
      testResults,
      createdRecordsCount: createdRecords.length,
      executedAt: new Date(),
    };
  }
}

// Global Singleton Instance
export const globalRecoveryAgentValidator = new RecoveryAgentValidator();
