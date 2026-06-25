import Redis, { RedisOptions } from 'ioredis';
import config from '@config/index';
import logger from '@shared/logger';

const redisOptions: RedisOptions = {
  host: config.valkey.host,
  port: config.valkey.port,
  password: config.valkey.password || undefined,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  retryStrategy(times) {
    if (times > 3) {
      // Stop retrying during bootstrap if it fails repeatedly
      return null;
    }
    const delay = Math.min(times * 100, 2000);
    return delay;
  },
};

export let valkeyClient: Redis | null = null;

/**
 * Initializes connection to Valkey/Redis instance
 */
export const connectValkey = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const client = new Redis(redisOptions);

      client.on('connect', () => {
        logger.debug('Valkey client connecting to server...');
      });

      client.on('ready', () => {
        logger.info('🔑 Valkey cache database connected successfully');
        valkeyClient = client;
        resolve();
      });

      client.on('error', (error) => {
        logger.error('Valkey connection error:', error);
        // If we haven't established the initial connection yet, reject the promise
        if (!valkeyClient) {
          client.disconnect();
          reject(error);
        }
      });
    } catch (error) {
      logger.error('❌ Failed to construct Valkey database client:', error);
      reject(error);
    }
  });
};

/**
 * Disconnects the Valkey database client
 */
export const disconnectValkey = async (): Promise<void> => {
  if (valkeyClient) {
    await valkeyClient.quit();
    valkeyClient = null;
  }
};

/**
 * Health check query for Valkey
 */
export const checkValkeyHealth = async (): Promise<boolean> => {
  try {
    if (!valkeyClient) {
      return false;
    }
    const pong = await valkeyClient.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('Valkey health check failed:', error);
    return false;
  }
};
