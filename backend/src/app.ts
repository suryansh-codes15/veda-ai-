import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import assignmentRoutes from './routes/assignment.routes';
import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocket } from './sockets/socket';
import { createWorker, setSocketServer } from './queues/worker';
import { getRedis } from './utils/redis';
import { startLocalServices, stopLocalServices } from './utils/local-services';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.vercel.app') ||
        origin === process.env.FRONTEND_URL;

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/chat', chatRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Bootstrap
async function bootstrap(): Promise<void> {
  const PORT = parseInt(process.env.PORT || '4000');
  
  // Start local portable services if needed
  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
  try {
    const services = await startLocalServices();
    mongoUri = services.mongoUri;
  } catch (err) {
    console.error('❌ Failed to setup/start local database services:', err);
    process.exit(1);
  }

  // Connect MongoDB
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Ping Redis
  const redis = getRedis();
  await redis.ping();
  console.log('✅ Redis connected');

  // Setup WebSocket
  const io = setupSocket(httpServer);

  // Start BullMQ worker in-process (for single-server deployments)
  // For production, run worker separately: npm run worker
  setSocketServer(io);
  createWorker();

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down VedaAI backend...');
    await stopLocalServices();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  httpServer.listen(PORT, () => {
    console.log(`🚀 VedaAI backend running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});

