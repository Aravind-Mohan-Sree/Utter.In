import { initializeAWSConfig } from './config/env.js';

async function bootstrap() {
  try {
    await initializeAWSConfig();
    await import('./app.js');
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
}

bootstrap();
