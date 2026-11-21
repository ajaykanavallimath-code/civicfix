require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const { seed } = require('./scripts/seed');
const Complaint = require('./models/Complaint');

const app = express();
const server = http.createServer(app);

// Parse allowed client URLs from process.env.CLIENT_URL (comma-separated list support)
const allowedClientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);

  const cleanOrigin = origin.replace(/\/$/, '');

  if (
    allowedClientUrls.includes(cleanOrigin) ||
    allowedClientUrls.includes('*') ||
    cleanOrigin.startsWith('http://localhost') ||
    cleanOrigin.startsWith('http://127.0.0.1')
  ) {
    return callback(null, true);
  }

  // Allow Vercel preview domains if vercel.app is in allowedClientUrls
  const allowsVercel = allowedClientUrls.some(u => u.includes('vercel.app'));
  if (allowsVercel && cleanOrigin.endsWith('.vercel.app')) {
    return callback(null, true);
  }

  // Permissive fallback
  return callback(null, true);
};

const corsOptions = {
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
};

// Configure Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Attach io to express app
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads and seed assets
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.use('/seed', express.static(path.join(__dirname, '..', 'client', 'public', 'seed')));
app.use('/seed', express.static(uploadsDir));

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicFix API Server',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Mount modular routes (will be populated in phases)
const complaintsRouter = require('./routes/complaints');
const departmentsRouter = require('./routes/departments');
const authRouter = require('./routes/auth');
const triageRouter = require('./routes/triage');

app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/triage', triageRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Start Server & ensure seed data is available
const PORT = process.env.PORT || 5000;

function validateEnvironment() {
  const missing = [];
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    missing.push('MONGODB_URI');
  }
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
    missing.push('GEMINI_API_KEY');
  }

  if (missing.length > 0) {
    console.error('\n' + '='.repeat(68));
    console.error('❌ FATAL STARTUP ERROR: Missing Required Environment Variables');
    console.error('='.repeat(68));
    console.error(`The server cannot start because the following required key(s) are empty:`);
    missing.forEach((v) => console.error(`  • ${v}`));
    console.error('\nPlease edit server/.env and add:');
    if (missing.includes('MONGODB_URI')) {
      console.error('  - MONGODB_URI: MongoDB connection string (e.g. mongodb://localhost:27017/civicfix or Atlas URI)');
    }
    if (missing.includes('GEMINI_API_KEY')) {
      console.error('  - GEMINI_API_KEY: Gemini API Key from Google AI Studio (https://aistudio.google.com/apikey)');
    }
    console.error('='.repeat(68) + '\n');
    process.exit(1);
  }
}

async function start() {
  try {
    // Validate required environment variables first
    validateEnvironment();

    await connectDB();
    
    // Check if complaints collection is empty, if so, seed immediately!
    const count = await Complaint.countDocuments();
    if (count === 0) {
      console.log('[Startup] No complaints detected. Seeding initial 28 demo complaints...');
      await seed();
    } else {
      console.log(`[Startup] Database ready with ${count} existing complaints.`);
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  CIVICFIX BACKEND RUNNING ON http://localhost:${PORT}`);
      console.log(`  Socket.IO real-time updates active`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal server startup failure:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
