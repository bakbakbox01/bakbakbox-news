import mongoose from 'mongoose';
import {
  enableMockMode,
  disableMockMode,
  shouldForceMock,
  hasMongoUri,
} from './dataMode.js';
import { initMockStore } from '../data/mock/store.js';

const DEFAULT_OPTIONS = {
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
  minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 2,
  serverSelectionTimeoutMS:
    Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
  retryWrites: true,
};

let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected [${mongoose.connection.host}]`);
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  listenersRegistered = true;
};

const activateMockMode = async (reason) => {
  enableMockMode(reason);
  await initMockStore();
};

/**
 * Connect to MongoDB when URI is available, otherwise use mock static data.
 * @returns {Promise<'database' | 'mock'>}
 */
export const connectDatabase = async () => {
  if (shouldForceMock()) {
    await activateMockMode('USE_MOCK_DATA=true');
    return 'mock';
  }

  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    await activateMockMode('MONGODB_URI is not set');
    return 'mock';
  }

  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    disableMockMode();
    console.log('MongoDB already connected');
    return 'database';
  }

  mongoose.set('strictQuery', true);
  registerConnectionListeners();

  try {
    await mongoose.connect(uri, DEFAULT_OPTIONS);
    disableMockMode();
    return 'database';
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    await activateMockMode(`connection failed: ${error.message}`);
    return 'mock';
  }
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
    throw error;
  }
};

export const isDatabaseConnected = () =>
  mongoose.connection.readyState === mongoose.ConnectionStates.connected;

export { hasMongoUri };
