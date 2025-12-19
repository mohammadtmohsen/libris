import mongoose from 'mongoose';

const URI = process.env.ATLAS_URI;

if (!URI) {
  throw new Error('ATLAS_URI is not defined');
}

const cache =
  globalThis._mongooseCache ||
  (globalThis._mongooseCache = { conn: null, promise: null });

// Connect to MongoDB with a global cache for serverless environments
const connectDB = async () => {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (mongoose.connection.readyState === 0) {
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(URI).then((mongooseInstance) => {
      console.log('Connected to MongoDB! from Libris Connection');
      return mongooseInstance;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
};

export default connectDB;
