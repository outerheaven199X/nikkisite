const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const chatRouter = require('./api/chat');
const auditRouter = require('./api/audit');
const { initDB } = require('./storage/sqlite');
const { logSystemEvent } = require('./logging/audit');
const llmManager = require('./llm/llmManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for potential frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', chatRouter);
app.use('/api/audit', auditRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    uptime: process.uptime()
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'databox API',
    version: '1.0.0',
    description: 'RAG system with SQLite FTS5 for demonstrating prompt injection vulnerabilities',
    endpoints: {
      'POST /api/chat': {
        description: 'Send a chat message and get AI response',
        parameters: {
          sessionId: 'string (required) - Session identifier',
          message: 'string (required) - User message',
          mode: 'string (optional) - "vulnerable" or "hardened" (default: "vulnerable")'
        },
        response: {
          response: 'string - AI response text',
          retrievedPassagesShown: 'boolean - Always false for security',
          mode: 'string - Current mode',
          injectionDetected: 'boolean - Whether injection was detected',
          retrievedPassagesCount: 'number - Number of passages retrieved',
          timestamp: 'string - Response timestamp'
        }
      },
      'GET /api/chat/history/:sessionId': {
        description: 'Get conversation history for a session',
        parameters: {
          sessionId: 'string (required) - Session identifier'
        }
      },
      'DELETE /api/chat/history/:sessionId': {
        description: 'Clear conversation history for a session',
        parameters: {
          sessionId: 'string (required) - Session identifier'
        }
      },
      'GET /api/chat/config': {
        description: 'Get current system configuration'
      }
    },
    security: {
      note: 'This system is designed for educational purposes to demonstrate prompt injection vulnerabilities and security hardening techniques.',
      modes: {
        vulnerable: 'Retrieved content is directly injected into system prompt',
        hardened: 'Retrieved content is quoted and marked as untrusted'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log system error
  logSystemEvent({
    eventType: 'server_error',
    details: {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    },
    level: 'error'
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await logSystemEvent({
    eventType: 'server_shutdown',
    details: { reason: 'SIGTERM' },
    level: 'info'
  });
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await logSystemEvent({
    eventType: 'server_shutdown',
    details: { reason: 'SIGINT' },
    level: 'info'
  });
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting databox server...');
    
    // Initialize database
    await initDB();
    console.log('✅ Database initialized');
    
    // Initialize LLM manager
    await llmManager.initialize();
    console.log('✅ LLM Manager initialized');
    
    // Log server startup
    await logSystemEvent({
      eventType: 'server_startup',
      details: {
        port: PORT,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      level: 'info'
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📚 API documentation: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('🔒 Security Note: This system demonstrates prompt injection vulnerabilities.');
      console.log('   Use "vulnerable" mode to see injection attacks in action.');
      console.log('   Use "hardened" mode to see security hardening techniques.');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await logSystemEvent({
      eventType: 'server_startup_failed',
      details: { error: error.message, stack: error.stack },
      level: 'error'
    });
    process.exit(1);
  }
}

// Start the server
startServer();
