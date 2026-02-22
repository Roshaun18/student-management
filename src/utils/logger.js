import winston from 'winston';

// Winston logger for console output
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const { service, ...rest } = meta;
          const metaStr = Object.keys(rest).length > 0 ? JSON.stringify(rest) : '';
          return `${timestamp} [${level}] ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// Send logs to backend
const sendLogToServer = async (level, message, data) => {
  try {
    const logData = {
      level,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : String(data)) : null,
      timestamp: new Date().toISOString()
    };
    
    // Try to send to backend
    try {
      await fetch('http://localhost:3001/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
    } catch (fetchErr) {
      // Server not available, silent fail
    }
  } catch (err) {
    // Fail silently to avoid infinite loops
  }
};

const logger = {
  info: (message, data) => {
    winstonLogger.info(message, data || '');
    sendLogToServer('info', message, data);
  },
  error: (message, error) => {
    winstonLogger.error(message, error || '');
    sendLogToServer('error', message, error);
  },
  warn: (message, data) => {
    winstonLogger.warn(message, data || '');
    sendLogToServer('warn', message, data);
  },
  debug: (message, data) => {
    winstonLogger.debug(message, data || '');
    sendLogToServer('debug', message, data);
  }
};

export default logger;
