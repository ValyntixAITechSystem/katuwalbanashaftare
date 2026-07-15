// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import compression from 'compression';
// import morgan from 'morgan';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import dotenv from 'dotenv';
// import { connectDB } from './config/database.js';
// import memberRoutes from './routes/memberRoutes.js';
// import familyRoutes from './routes/familyRoutes.js';
// import donationRoutes from './routes/donationRoutes.js';
// import organizationRoutes from './routes/organizationRoutes.js';
// import { errorHandler } from './middlewares/errorHandler.js';

// dotenv.config();

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// // Middleware
// app.use(helmet());
// app.use(compression());
// app.use(cors());
// app.use(morgan('combined'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Routes
// app.use('/api/members', memberRoutes);
// app.use('/api/family', familyRoutes);
// app.use('/api/donations', donationRoutes);
// app.use('/api/organization', organizationRoutes);

// // Error handling
// app.use(errorHandler);

// // Socket.IO
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Export io for use in controllers
// export { io };

// // Connect to MongoDB and start server
// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   httpServer.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });



import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './middlewares/logger.js';
import { rateLimit } from './middlewares/rateLimit.js';

// Import routes
import memberRoutes from './routes/memberRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://katuwalbanshabatika.netlify.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://katuwalbanshabatika.netlify.app/',
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(logger.combined);
} else {
  app.use(logger.dev);
}

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/organization', organizationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Error handling
app.use(errorHandler);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join', (data) => {
    socket.join(data.room);
    console.log(`Socket ${socket.id} joined room ${data.room}`);
  });
  
  socket.on('leave', (data) => {
    socket.leave(data.room);
    console.log(`Socket ${socket.id} left room ${data.room}`);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Export io for use in controllers
export { io };

// Start server
const PORT = process.env.PORT || "https://katuwalbanshabatika.netlify.app/";

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});