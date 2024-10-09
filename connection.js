import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
const connectDB = async () => {
  configDotenv();
  try {
    await mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_COLLECTION}`);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  }
};

export default connectDB;
