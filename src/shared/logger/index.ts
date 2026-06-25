import winston from 'winston';
import config from '@config/index';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors configuration
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format for development console (pretty-printed, colorized)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`,
  ),
);

// Log format for production (structured JSON for log aggregators)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define log transports
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.env === 'development' ? developmentFormat : productionFormat,
  }),
];

// If in production, output logs to physical files as well
if (config.env === 'production') {
  transports.push(
    // Write all errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: productionFormat,
    }),
    // Write all application logs to application.log
    new winston.transports.File({
      filename: 'logs/application.log',
      format: productionFormat,
    }),
  );
}

// Create the winston logger instance
export const logger = winston.createLogger({
  level: config.log.level,
  levels,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: config.env === 'development' ? developmentFormat : productionFormat,
    }),
    ...(config.env === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: productionFormat,
          }),
        ]
      : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: config.env === 'development' ? developmentFormat : productionFormat,
    }),
    ...(config.env === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: productionFormat,
          }),
        ]
      : []),
  ],
  exitOnError: false, // Avoid exiting the process automatically; let handlers do it if necessary
});

export default logger;
