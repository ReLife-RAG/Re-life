import dotenv from "dotenv";
import {connectDB} from "./config/db";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
  try {
    console.log('Starting server...');
    
    // 1. Connect to Database FIRST
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      console.log('Database connected successfully');
    } else {
      console.warn('Database is not connected. Some features may fail in development.');
    }

    // 2. Load the app only after DB is ready
    const app = (await import("./app")).default;
    console.log('Express app loaded');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth/*`);
    });

    server.on('error', (error: any) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
    server.on('listening', () => {
      console.log('Server successfully bound to port and listening!');
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
