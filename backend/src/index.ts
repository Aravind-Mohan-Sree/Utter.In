import { initializeAWSConfig } from './config/env';

async function main() {
  try {
    console.log('--- STARTING BOOTSTRAP ---');
    await initializeAWSConfig();
    console.log('--- AWS CONFIG READY ---');
    
    // Load app.ts after env is initialized
    const { startServer } = require('./app');
    await startServer();
  } catch (error) {
    console.error('--- BOOTSTRAP FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

void main();
