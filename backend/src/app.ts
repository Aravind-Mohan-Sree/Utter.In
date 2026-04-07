import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';

import { initializeAWSConfig, env } from '~config/env';

async function startServer() {
  await initializeAWSConfig();

  const { connectDB } = require('./infrastructure/databases/mongo/connection');
  const { errorHandler } = require('./middlewares/errorHandler');
  const { requestLogger } = require('./middlewares/requestLogger');
  const { logger } = require('./infrastructure/logger/logger');

  const { userRouter } = require('./presentation/routes/userRoutes');
  const { tutorRouter } = require('./presentation/routes/tutorRoutes');
  const { adminRouter } = require('./presentation/routes/adminRoutes');
  const { SocketManager } = require('./services/SocketManager');

  require('./infrastructure/strategies/googleUserStrategy');
  require('./infrastructure/strategies/googleTutorStrategy');
  
  const app = express();
  const port = env.PORT;

  try {
    await connectDB();
    logger.info('Database connection successful');
  } catch (error: any) {
    logger.error(error);
    process.exit(1);
  }

  app.use(morgan('dev'));

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(requestLogger);

  app.use('/api/user', userRouter);
  app.use('/api/tutor', tutorRouter);
  app.use('/api/admin', adminRouter);

  app.use(errorHandler);

  const server = createServer(app);

  SocketManager.getInstance().init(server, env.FRONTEND_URL);

  server.listen(port, () => {
    logger.info(`App is running on port ${port}`);
  });
}

export { startServer };