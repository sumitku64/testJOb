const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { rateLimit } = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import database connection
const connectDB = require('./config/db');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Body parser with increased limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS - More permissive configuration for development
app.use(cors({
  origin: [
    'http://localhost:5173', // for local development
    'https://your-frontend-domain.com', // your production frontend
    // Add any other domains that need access
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Security headers - Disable CSP temporarily for testing
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Basic error handler
// Move this block to the end of the file, just before the PORT definition
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Lawyer Booking API',
      version: '1.0.0',
      description: 'API documentation for the Lawyer Booking System'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/v1`
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routes
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});

app.get('/api/v1/test', (req, res) => {
  res.json({
    message: 'Backend is connected successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
// Add this route near your other test routes
app.get('/api/v1/db-test', (req, res) => {
  try {
    const status = mongoose.connection.readyState;
    const statusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[status];
    
    res.json({
      status: statusText,
      readyState: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));

// Add this before other routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
const PORT = process.env.PORT || 5000;

let server;
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Then start the server
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
