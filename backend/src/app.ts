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

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  try {
    await connectDB();
    logger.info('Database connection successful');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }

  app.use(cors({
    origin: 'http://localhost:4000',
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ],
  }));

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
