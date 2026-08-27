import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import agentLogRoutes from './src/routes/agentLogRoutes.js';
import monitoringRoutes from './src/routes/monitoringRoutes.js';
import riskEventRoutes from './src/routes/riskEventRoutes.js';
import riskConfigRoutes from './src/routes/riskConfigRoutes.js';
import cartAbandonmentRoutes from './src/routes/cartAbandonmentRoutes.js';
import { startMonitoringAgent } from './src/services/monitoringAgentService.js';
import { startAbandonmentDetectorJob } from './src/services/cartAbandonmentService.js';
import { errorHandler, notFound } from './src/middlewares/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/agent-logs', agentLogRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/risk-events', riskEventRoutes);
app.use('/api/risk-config', riskConfigRoutes);
app.use('/api/cart-abandonment', cartAbandonmentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Start Event Monitoring Agent background polling loop (every 5 seconds)
  startMonitoringAgent(5000);
  // Start Cart Abandonment Detector scheduled job (every 10 minutes)
  startAbandonmentDetectorJob(10);
});
