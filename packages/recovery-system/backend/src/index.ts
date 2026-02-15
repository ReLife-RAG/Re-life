import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { ENV } from './config/env';

// Import your routes
import counselorRoutes from './routes/Counselor.routes';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create Express app
    const app = express();

    // Middleware
    app.use(cors({
      origin: ENV.FRONTEND_URL,
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api', counselorRoutes);

    // Health check route
    app.get('/', (req, res) => {
      res.json({
        message: 'Re-Life Recovery System API',
        status: 'OK',
        timestamp: new Date().toISOString()
      });
    });

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    });

    // Start server
    app.listen(ENV.PORT, () => {
      console.log(`✅ Server running on port ${ENV.PORT}`);
      console.log(`🌐 API available at http://localhost:${ENV.PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();