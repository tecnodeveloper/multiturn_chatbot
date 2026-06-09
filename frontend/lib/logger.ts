import pino from 'pino';

const logger = pino({
  browser: {
    asObject: true
  },
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
});

export default logger;
