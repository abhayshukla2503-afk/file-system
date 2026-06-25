import { Pool, PoolConfig } from 'pg';
import config from '@config/index';
import logger from '@shared/logger';

const pgConfig: PoolConfig = {
  host: config.postgres.host,
  port: config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection fails
};

export const pgPool = new Pool(pgConfig);

// Handle pool connection events
pgPool.on('connect', () => {
  logger.debug('PostgreSQL database client established a connection to the pool');
});

pgPool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client in pool:', err);
});

/**
 * Verifies connection by connecting a client from the pool
 */
export const connectPostgres = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    logger.info('🐘 PostgreSQL database connected successfully');
    client.release();
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL database:', error);
    throw error;
  }
};

/**
 * Health check query for PostgreSQL
 */
export const checkPostgresHealth = async (): Promise<boolean> => {
  try {
    const result = await pgPool.query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    logger.error('PostgreSQL health check failed:', error);
    return false;
  }
};
