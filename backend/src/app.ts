import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from '~connect-db/connection';
import { errorHandler } from '~middlewares/errorHandler';
import { env } from '~config/env';
import { requestLogger } from '~middlewares/requestLogger';
import { logger } from '~logger/logger';
import morgan from 'morgan';
import cors from 'cors';
import { userRouter } from '~routes/userRoutes';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import '~infrastructure-strategies/googleStrategy';

dotenv.config();

async function startServer() {
  const app = express();

  try {
    await connectDB();
    logger.info('Database connection successful');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }

  app.use(cookieParser());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(passport.initialize());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },

    // Crucial: IP identification must be robust for proxies
    // keyGenerator: (req: Request) => {
    //   // Check for IP forwarded by a proxy (like Nginx, Vercel, etc.)
    //   const forwarded = req.headers['x-forwarded-for'];
    //   return forwarded
    //     ? String(forwarded).split(',')[0]
    //     : req.socket.remoteAddress;
    // },
  });

  app.use(globalLimiter);

  app.use(requestLogger);

  app.use('/api/user', userRouter);

  app.use(errorHandler);
  app.use(morgan('dev'));

  const port = env.PORT;

  app.listen(port, () => {
    logger.info(`App is running on http://localhost:${port}`);
  });
}

void startServer();
