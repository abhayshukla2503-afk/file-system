import mongoose from 'mongoose';
import config from '@config/index';
import logger from '@shared/logger';

// Disable mongoose buffering to fail queries fast if not connected
mongoose.set('bufferCommands', false);

/**
 * Initializes mongoose connection to MongoDB
 */
export const connectMongo = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('🍃 MongoDB database connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB database disconnected');
    });

    await mongoose.connect(config.mongo.uri, {
      connectTimeoutMS: 5000,
    });
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB database:', error);
    throw error;
  }
};

/**
 * Disconnects mongoose database client
 */
export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
};

/**
 * Health check for MongoDB
 */
export const checkMongoHealth = (): boolean => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
};
