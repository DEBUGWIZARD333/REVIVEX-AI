import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import riskConfigService from './src/services/riskConfigService.js';
import * as recoveryAgentService from './src/services/recoveryAgentService.js';
import dotenv from 'dotenv';
dotenv.config();

async function simulateSecondCustomerSMS() {
  await connectDB();
  let secondUser = await User.findOne({ email: 'navee@gmail.com' });
  if (!secondUser) {
    secondUser = await User.create({
      name: 'Navee',
      email: 'navee@gmail.com',
      phone: '+919626848775',
      password: 'password123',
      role: 'user'
    });
  } else {
    secondUser.phone = '+919626848775';
    await secondUser.save();
  }

  console.log('Target Customer 2 Name:', secondUser.name, '| Registered Phone:', secondUser.phone);
  const product = await Product.findOne({});

  const evalResult = await riskConfigService.evaluateAndCreateRiskEvent({
    userId: secondUser._id,
    eventType: 'CART_ABANDONED',
    riskAmount: product ? product.price : 149.99,
    riskReason: 'Cart abandoned by customer Navee',
    relatedCartId: null,
    idleMinutes: 1,
    detectedAt: new Date()
  });

  console.log('Risk Event Created for Customer 2:', evalResult.riskEvent._id);
  
  const recoveryRes = await recoveryAgentService.processDecisionOutput(evalResult.decisionOutcome);
  console.log('--- RECOVERY DISPATCH RESULT FOR CUSTOMER 2 ---');
  console.log(JSON.stringify(recoveryRes, null, 2));
  process.exit(0);
}
simulateSecondCustomerSMS();
