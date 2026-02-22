import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Generate log filename based on date
const getLogFileName = () => {
  const today = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `app-${today}.log`);
};

// Log endpoint
app.post('/api/logs', (req, res) => {
  try {
    const { level, message, data, timestamp } = req.body;
    
    // Format log entry
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level || 'info',
      message,
      data
    };
    
    // Create formatted log line
    const logLine = `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}] ${logEntry.message}`;
    const dataStr = data ? `\n  Data: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}` : '';
    
    // Write to file
    const logFile = getLogFileName();
    fs.appendFileSync(logFile, logLine + dataStr + '\n\n', 'utf8');
    
    // Also log to console
    console.log(logLine, data || '');
    
    res.json({ success: true, message: 'Log saved' });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get logs endpoint
app.get('/api/logs/view', (req, res) => {
  try {
    const logFile = getLogFileName();
    
    if (!fs.existsSync(logFile)) {
      return res.json({ content: 'No logs available yet' });
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download logs endpoint
app.get('/api/logs/download', (req, res) => {
  try {
    const logFile = getLogFileName();
    
    if (!fs.existsSync(logFile)) {
      return res.status(404).json({ error: 'No logs available' });
    }
    
    res.download(logFile, `app-logs-${new Date().toISOString().split('T')[0]}.log`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Logger server running', logDir: logsDir });
});

// serve React build in production so the whole app can run on one port
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'dist');
  app.use(express.static(buildPath));

  // any other route should return the client index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Logger server running on http://localhost:${PORT}`);
  console.log(`Logs will be saved to: ${logsDir}`);
});
