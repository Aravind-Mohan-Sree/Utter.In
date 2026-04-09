import { initializeAWSConfig, env } from './config/env.js';

async function bootstrap() {
  try {
    await initializeAWSConfig();
    console.log('--- AWS CONFIG LOADED ---');
    
    await import('./app.js');
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
}

bootstrap();
