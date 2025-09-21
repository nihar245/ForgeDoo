import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from './config.js';

const logTransports = [];

if (config.isProd) {
  logTransports.push(new transports.Console({ format: format.json() }));
  logTransports.push(new DailyRotateFile({ filename: 'logs/%DATE%.log', datePattern: 'YYYY-MM-DD', zippedArchive: false, maxFiles: '14d', format: format.json() }));
} else {
  logTransports.push(new transports.Console({ format: format.combine(format.colorize(), format.simple()) }));
}

export const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: logTransports
});
