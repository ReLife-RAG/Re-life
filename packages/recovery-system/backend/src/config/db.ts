import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relife-recovery';
    
    await mongoose.connect(mongoURI);
    
    console.log(' MongoDB Connected Successfully');
  } catch (error: any) {
    console.error(' MongoDB Connection Error:', error.message);
    // Don't exit in development, just log the error
    console.log('  Continuing without database connection (using in-memory for testing)');
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});
