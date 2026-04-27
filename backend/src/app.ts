import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';

import { connectDB } from '~connect-db/connection';
import { errorHandler } from '~middlewares/errorHandler';
import { requestLogger } from '~middlewares/requestLogger';
import { logger } from '~logger/logger';
import { userRouter } from '~routes/userRoutes';
import { tutorRouter } from '~routes/tutorRoutes';
import { adminRouter } from '~routes/adminRoutes';
import { SocketManager } from '~concrete-services/SocketManager';
import { env } from '~config/env';

import '~strategies/googleUserStrategy';
import '~strategies/googleTutorStrategy';

export async function startServer() {
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

  app.use('/user', userRouter);
  app.use('/tutor', tutorRouter);
  app.use('/admin', adminRouter);

  app.use(errorHandler);

  const server = createServer(app);

  SocketManager.getInstance().init(server, env.FRONTEND_URL);

  server.listen(port, () => {
    logger.info(`App is running on port ${port}`);
  });
}

void startServer();