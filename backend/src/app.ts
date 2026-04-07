import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';

import { initializeAWSConfig } from '~config/env';

async function startServer() {
  await initializeAWSConfig();

  const _import = async <T>(path: string): Promise<T> => import(path) as Promise<T>;

  const { connectDB } = await _import<typeof import('~connect-db/connection')>('~connect-db/connection');
  const { errorHandler } = await _import<typeof import('~middlewares/errorHandler')>('~middlewares/errorHandler');
  const { env } = await _import<typeof import('~config/env')>('~config/env');
  const { requestLogger } = await _import<typeof import('~middlewares/requestLogger')>('~middlewares/requestLogger');
  const { logger } = await _import<typeof import('~logger/logger')>('~logger/logger');
  const { userRouter } = await _import<typeof import('~routes/userRoutes')>('~routes/userRoutes');
  const { tutorRouter } = await _import<typeof import('~routes/tutorRoutes')>('~routes/tutorRoutes');
  const { adminRouter } = await _import<typeof import('~routes/adminRoutes')>('~routes/adminRoutes');
  const { SocketManager } = await _import<typeof import('~concrete-services/SocketManager')>('~concrete-services/SocketManager');

  await _import('~strategies/googleUserStrategy');
  await _import('~strategies/googleTutorStrategy');

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