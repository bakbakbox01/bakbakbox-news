import winston from 'winston';
import env from './env.js';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const transports = [
  new winston.transports.Console({
    format: env.isProduction
      ? combine(timestamp(), errors({ stack: true }), json())
      : combine(colorize(), timestamp(), errors({ stack: true }), devFormat),
  }),
];

if (env.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

export const logger = winston.createLogger({
  level: env.logLevel,
  defaultMeta: { service: 'bakbakbox-server' },
  transports,
});

export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};
