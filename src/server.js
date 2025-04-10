import "./config/env.js"
import app from "./app.js"
import connectDB from "./config/db.js"
import { connectRedis } from "./config/redis.js"
import logger from "./utils/logger.js"

const PORT = process.env.PORT || 5010; 

async function startServer() {
    try {
      await connectDB();
      await connectRedis();
      
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });

    } catch (err) {      
      logger.error('Failed to start server:', err);
      process.exit(1);
    }
  }
  
  startServer();




