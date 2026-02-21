import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import DatabaseConfig from './config/database';
import { connectRedis } from './config/redis';
import './models/associations';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import cvTemplateRoutes from './routes/cvTemplate.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import messageRoutes from './routes/message.routes';
import companyRoutes from './routes/company.routes';
import notificationRoutes from './routes/notification.routes';
import savedJobRoutes from './routes/saved-job.routes';
import savedCandidateRoutes from './routes/saved-candidate.routes';
import { authenticateJWT, AuthRequest } from './middleware/auth.middleware';
import { setupCronJobs } from './utils/cronjobs';
import { setupWebSocket } from './websocket/socket';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/', cvTemplateRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);
app.use('/messages', messageRoutes);
app.use('/companies', companyRoutes);
app.use('/notifications', notificationRoutes);
app.use('/saved/jobs', savedJobRoutes);
app.use('/saved/candidates', savedCandidateRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Jobly API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/test-auth', authenticateJWT, (req: AuthRequest, res) => {
  res.json({ message: 'Authenticated!', user: req.user });
});

// 404 handler - phải đặt sau tất cả routes
app.use(notFoundHandler);

// Error handler - phải đặt cuối cùng
app.use(errorHandler);

// Setup WebSocket
export const io = setupWebSocket(httpServer);

const db = DatabaseConfig.getInstance();
db.testConnection().then(async () => {
  // Sync database models - alter disabled to prevent crash
  await DatabaseConfig.getInstance().getSequelize().sync();
  console.log('Database models synced');

  // Connect Redis
  await connectRedis();

  // Setup cronjobs
  setupCronJobs();

  httpServer.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`WebSocket server ready`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready`);
  });
}).catch((error: any) => {
  logger.error('Failed to connect to database:', error);
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
