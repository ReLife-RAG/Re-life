import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relife-recovery';
    
    await mongoose.connect(mongoURI);
    
    console.log(' MongoDB Connected Successfully');
  } catch (error: any) {
    console.error(' MongoDB Connection Error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database connection failed in production. Check MONGODB_URI and network access.');
    }
    // Don't exit in development, just log the error
    console.log('  Continuing without database connection (development mode only)');
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});
