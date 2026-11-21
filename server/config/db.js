const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicfix').trim();
  
  try {
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Connection string does not start with mongodb:// or mongodb+srv://');
    }
    // Attempt connecting to the configured MongoDB URI (e.g. local daemon or Atlas)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB successfully`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB (${err.message}).`);
    console.log(`[Database] Falling back to embedded MongoMemoryServer for instant zero-config operation...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize embedded MongoDB:', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] Mongoose connection error:', err);
  });

  return mongoose.connection;
}

module.exports = { connectDB };
