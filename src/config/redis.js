import { createClient } from 'redis';
import logger from "../utils/logger.js"

const redis = createClient({
    username: process.env.REDIS_USER || 'default', 
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST, 
        port: process.env.REDIS_PORT || 16970
    }
});

redis.on('error', (err) => logger.error('Redis Client Error:', err));
redis.on('connect', () => logger.info('Connecting to Redis...'));
redis.on('ready', () => logger.info('Redis connected successfully'));
redis.on('end', () => logger.warn('Redis disconnected'));


process.on('SIGINT', async () => {
    await redis.quit();
});

const connectRedis = async () => {
    try {
        await redis.connect();
        return redis;
    } catch (err) {        
        logger.error('Redis connection failed:', err);
        process.exit(1);
    }  
};


export { redis,connectRedis}
