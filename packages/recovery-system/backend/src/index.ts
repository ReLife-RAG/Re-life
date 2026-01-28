import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database FIRST
    await connectDB();
    
    // 2. Load the App ONLY after DB is ready (Dynamic Import)
    // This ensures BetterAuth finds a valid database connection
    const app = (await import("./app")).default;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();