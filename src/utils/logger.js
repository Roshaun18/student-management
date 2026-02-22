// Browser-safe logger for frontend apps.
// Note: Winston is Node-oriented and can break browser bundles.

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
    console.info('[INFO]', message, data || '');
    sendLogToServer('info', message, data);
  },
  error: (message, error) => {
    console.error('[ERROR]', message, error || '');
    sendLogToServer('error', message, error);
  },
  warn: (message, data) => {
    console.warn('[WARN]', message, data || '');
    sendLogToServer('warn', message, data);
  },
  debug: (message, data) => {
    console.debug('[DEBUG]', message, data || '');
    sendLogToServer('debug', message, data);
  }
};

export default logger;
