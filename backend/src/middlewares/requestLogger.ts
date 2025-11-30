import morgan from 'morgan';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request } from 'express';

function sanitize(obj: Record<string, unknown>) {
  if (!obj || typeof obj !== 'object') return obj;

  const clone = { ...obj };

  delete clone.password;
  delete clone.confirmPassword;
  delete clone.token;
  delete clone.accessToken;
  delete clone.refreshToken;
  delete clone.secret;
  delete clone.authorization;

  return clone;
}

morgan.token('reqdata', (req: Request) => {
  const data: Record<string, unknown> = {};

  if (req.body && Object.keys(req.body).length)
    data.body = sanitize(req.body as Record<string, unknown>);

  if (req.query && Object.keys(req.query).length)
    data.query = sanitize(req.query as Record<string, unknown>);

  if (req.params && Object.keys(req.params).length)
    data.params = sanitize(req.params as Record<string, unknown>);

  return Object.keys(data).length
    ? JSON.stringify(data)
    : '';
});

const accessLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, message }) => {
    return `${timestamp} ${message}`;
  }),
);

export const accessLogger = winston.createLogger({
  level: 'info',
  format: accessLogFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '7d',
    }),
  ],
});

const stream = {
  write: (message: string) => {
    accessLogger.info(message.trim());
  },
};

export const requestLogger = morgan(
  ':method :url :status :response-time ms :reqdata',
  { stream },
);
