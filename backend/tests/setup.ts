import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { io } from '../src/server';

let mongoServer: MongoMemoryReplSet;

// Mock logger to keep test output clean
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock Cloudinary to avoid real uploads during tests
jest.mock('../src/utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://res.cloudinary.com/fake/image.jpg'),
  deleteImage: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  // Ensure we don't connect to a real database during tests
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  
  // Close socket.io connections if they are open
  if (io) {
    io.close();
  }
});
