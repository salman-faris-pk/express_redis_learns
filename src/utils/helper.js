import jwt from "jsonwebtoken"
import { redis } from "../config/redis.js"



export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
      { _id: userId }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { _id: userId }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: '2d' }
    );
    
    return { accessToken, refreshToken };
  };


  export const invalidateUsersCache = async () => {
    try {
      const keys = await redis.keys('users:*');
      
      if (keys.length > 0) { 
        await redis.del(keys);
      }
    } catch (err) {
      console.error('Error invalidating users cache:', err);
    }
  };


  export const invalidateNotesCache = async (userId) => {
    try {
      const keys = await redis.keys(`notes:*:user:${userId}`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      await redis.del(`pinned:user:${userId}`);
    } catch (err) {
      console.error('Error invalidating notes cache:', err);
    }
  };  