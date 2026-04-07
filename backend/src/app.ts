import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';

import { connectDB } from '~connect-db/connection';
import { env, initializeAWSConfig } from '~config/env';
import { logger } from '~logger/logger';

async function startServer() {
  await initializeAWSConfig();

  const { userRouter } = await import('~routes/userRoutes.js');
  const { tutorRouter } = await import('~routes/tutorRoutes.js');
  const { adminRouter } = await import('~routes/adminRoutes.js');
  const { requestLogger } = await import('~middlewares/requestLogger.js');
  const { errorHandler } = await import('~middlewares/errorHandler.js');
  const { SocketManager } = await import('~concrete-services/SocketManager.js');

  await import('~strategies/googleUserStrategy.js');
  await import('~strategies/googleTutorStrategy.js');

  const app = express();
  const port = env.PORT;

  try {
    await connectDB();
    logger.info('Database connection successful');
  } catch (error) {
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

void startServer();