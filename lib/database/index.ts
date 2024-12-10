import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const uri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!uri) throw new Error('MongoDB URI is missing');

    return await mongoose.connect(uri, {
      dbName: process.env.NODE_ENV === 'test' ? 'test_db' : 'next-event', // next-event or eventastic
      bufferCommands: false,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
