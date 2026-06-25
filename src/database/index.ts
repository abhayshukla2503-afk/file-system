import { connectPostgres, checkPostgresHealth, pgPool } from './postgres';
import { connectMongo, checkMongoHealth, disconnectMongo } from './mongo';
import { connectValkey, checkValkeyHealth, disconnectValkey, valkeyClient } from './valkey';
import logger from '@shared/logger';

/**
 * Bootstraps all database clients in parallel/sequence
 */
export const initDatabases = async (): Promise<void> => {
  logger.info('Initializing system database connections...');
  // Force sequential connection to ensure precise logs ordering
  await connectPostgres();
  await connectMongo();
  await connectValkey();
  logger.info('✅ All database connections established successfully');
};

/**
 * Disconnects and releases pools for all database clients
 */
export const closeDatabases = async (): Promise<void> => {
  logger.info('Closing database connections...');
  try {
    await pgPool.end();
    logger.debug('PostgreSQL pool shut down');
  } catch (err) {
    logger.error('Error closing PostgreSQL pool:', err);
  }

  try {
    await disconnectMongo();
    logger.debug('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
  }

  try {
    await disconnectValkey();
    logger.debug('Valkey client disconnected');
  } catch (err) {
    logger.error('Error disconnecting Valkey client:', err);
  }
  logger.info('Database cleanup complete');
};

export interface DatabaseHealth {
  postgres: boolean;
  mongodb: boolean;
  valkey: boolean;
}

/**
 * Checks all database clients status
 */
export const checkDatabasesHealth = async (): Promise<DatabaseHealth> => {
  const [postgres, valkey] = await Promise.all([checkPostgresHealth(), checkValkeyHealth()]);
  const mongodb = checkMongoHealth();

  return {
    postgres,
    mongodb,
    valkey,
  };
};

export { pgPool, valkeyClient };
export { checkPostgresHealth } from './postgres';
export { checkMongoHealth } from './mongo';
export { checkValkeyHealth } from './valkey';
