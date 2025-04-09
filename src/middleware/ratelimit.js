import { redis } from '../config/redis.js';
import logger from '../utils/logger.js';

const rateLimit = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const key = `rate_limit:${ip}`;
        
        const requests = await redis.incr(key);
        
        if (requests === 1) {
            await redisClient.expire(key, 60);
        }
        
        res.set({
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': Math.max(0, 100 - requests),
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 60
        });
        
        if (requests > 100) {
            logger.warn(`Rate limit exceeded for IP: ${ip}`);
            return res.status(429).json({ 
                message: 'Too many requests, please try again later',
                retryAfter: '60 seconds'
            });
        }
        
        next();
    } catch (err) {
        logger.error(`Rate limit middleware error: ${err}`);
        next();
    }
};

export default rateLimit;