import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, splat, json, printf, colorize } = format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level} ${stack || message}${metaStr}`;
});

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    format: combine(
        errors({ stack: true }),
        splat(),
        timestamp(),
        isProd ? json() : combine(colorize(), devFormat)
    ),
    transports: [new transports.Console()],
    exitOnError: false
});

export default logger;
