import app from './app';
import config from '@config/index';
import { initDatabases, closeDatabases } from '@database/index';
import logger from '@shared/logger';
import { Server } from 'http';

let server: Server;

/**
 * Initializes databases and starts Express server listener
 */
const startServer = async (): Promise<void> => {
  try {
    // 1. Bootstrap all databases
    await initDatabases();

    // 2. Start Express HTTP Server
    const port = config.port;
    server = app.listen(port, () => {
      logger.info(`🚀 Server running in ${config.env} mode on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('❌ Critical failure starting server:', error);
    process.exit(1);
  }
};

/**
 * Handles graceful shutdown by closing server and databases cleanly
 */
const shutdown = async (signal: string): Promise<void> => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  const forceTimeout = setTimeout(() => {
    logger.error('Forced shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server listener closed.');
      try {
        await closeDatabases();
        clearTimeout(forceTimeout);
        logger.info('Graceful shutdown completed successfully. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error('Failed to clean up databases during shutdown:', err);
        clearTimeout(forceTimeout);
        process.exit(1);
      }
    });
  } else {
    clearTimeout(forceTimeout);
    process.exit(0);
  }
};

// Register listeners for terminal termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server execution
startServer();
