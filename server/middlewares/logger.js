import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create write streams
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for request ID
morgan.token('reqId', (req) => req.id || '-');

// Custom format for development
const devFormat = ':method :url :status :res[content-length] - :response-time ms';

// Custom format for production
const prodFormat = ':reqId :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

export const logger = {
  // Development logger
  dev: morgan(devFormat, { stream: process.stdout }),
  
  // Production logger
  prod: morgan(prodFormat, { 
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400,
  }),
  
  // Error logger
  error: morgan(prodFormat, { 
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400,
  }),
  
  // Combined logger (use both streams)
  combined: morgan(prodFormat, { 
    stream: {
      write: (message) => {
        accessLogStream.write(message);
        process.stdout.write(message);
      },
    },
  }),
};