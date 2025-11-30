import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

function getCallerLocation(stack?: string): string | undefined {
  if (!stack) return undefined;

  const lines = stack.split('\n').slice(1);
  const callerLine = lines.find((line) => {
    const isNodeModules = line.includes('node_modules');
    const isLoggerFile = line.includes('logger.ts');
    const hasSrc =
      line.includes(`${path.sep}src${path.sep}`) ||
      line.includes('/src/') ||
      line.includes('\\src\\');

    return hasSrc && !isNodeModules && !isLoggerFile;
  });

  if (!callerLine) return undefined;

  const match =
    callerLine.match(/\((.+?):(\d+):(\d+)\)/) ||
    callerLine.match(/at (.+?):(\d+):(\d+)/);

  if (!match) return undefined;

  const fullPath = match[1].replace(/\\/g, '/');
  const lineNo = match[2];

  const relative = path.relative(process.cwd(), fullPath);
  return `${relative}:${lineNo}`;
}

const cleanFormat = winston.format.printf((info) => {
  const { timestamp, level, message, stack } = info;

  const location =
    getCallerLocation(typeof stack === 'string' ? stack : undefined) ||
    getCallerLocation((info as { error?: { stack?: string } }).error?.stack);

  const base = `${timestamp} [${level}]`;

  if (location) {
    return `${base} ${message} → ${location}`;
  }

  return `${base} ${message}`;
});

const fileLogFormat = winston.format.combine(
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  cleanFormat,
);

const consoleLogFormat = winston.format.combine(
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
  winston.format.colorize({ level: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  cleanFormat,
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileLogFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
      level: 'info',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d',
      level: 'error',
    }),
    new winston.transports.Console({
      format: consoleLogFormat,
    }),
  ],
});
