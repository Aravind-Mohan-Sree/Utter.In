import { logger } from '~logger/logger.js';
import { initializeAWSConfig } from './config/env.js';

async function bootstrap() {
  try {
    await initializeAWSConfig();
    await import('./app.js');
  } catch (error) {
    logger.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  logger.error('Unhandled bootstrap error:', error);
  process.exit(1);
});
