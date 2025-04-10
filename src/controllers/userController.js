import User from "../models/User.js"
import bcrypt from "bcrypt"
import { redis } from "../config/redis.js"
import { generateTokens, invalidateUsersCache } from "../utils/helper.js";
import jwt from "jsonwebtoken"


const register=async(req,res)=>{
    try {

        const existingUser = await User.findOne({ email: req.body.email });

         if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        };

        const user = new User(req.body);
        await user.save();

        const {accessToken,refreshToken}=generateTokens(user._id);

        await redis.set(`refresh:${refreshToken}`, user._id.toString(), 'EX', 2 * 24 * 60 * 60);          
          
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
          });
          
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 24 * 60 * 60 * 1000 
          });

          await invalidateUsersCache();

           return res.status(201).json({
            message: 'user created success',
            user
          });
        
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};


const login=async(req,res)=>{
    try {
        const { email, password } = req.body;
        const user=await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
          };

        const isMatch = await bcrypt.compare(password, user.password);
          
        if (!isMatch){
            return res.status(404).json({ message: "Invalid credentials" });
        };

        const { accessToken, refreshToken } = generateTokens(user._id);

        await redis.set(`refresh:${refreshToken}`, user._id.toString(), 'EX', 2 * 24 * 60 * 60);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
          });
          
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 24 * 60 * 60 * 1000 
          });

           return res.status(201).json({
            message: 'user logined successful',
            user,
            _accestoken: accessToken,
          });

        
    } catch (error) {
        res.status(400).send({ error: error.message });
    }

};


const refreshToken = async(req,res)=>{
    try {

        const refreshToken= req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        };

        const decoded= jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        const userId= await redis.get(`refresh:${refreshToken}`)        
        if(!userId || userId !== decoded._id.toString()){
            return res.status(401).json({ message: "Invalid refresh token" });
        };

        const {accessToken,refreshToken:newRefreshToken}=generateTokens(decoded._id)
        
        await redis.del(`refresh:${refreshToken}`);

        await redis.set(`refresh:${newRefreshToken}`, decoded._id.toString(), 'EX', 2 * 24 * 60 * 60);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
          });
          
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 24 * 60 * 60 * 1000
          });

          return res.status(201).json({
            _accessToken:accessToken
          })

    } catch (error) {
        res.status(401).send({ error: error.message });
    }
};


const logout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await redis.del(`refresh:${refreshToken}`);
      }
      
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      return res.status(200).json({ message: 'Logged out successfully' });

    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  };



   const getUser = async(req,res)=>{
     try {
      const userId=req.params.id;

      const cacheduser =await redis.hGet(`user:${userId}`, 'data');
      
      if(cacheduser){
        return res.status(200).json({
          success:true,
          user: JSON.parse(cacheduser)
        })
      };
      
      const user= await User.findById(userId).select('-password -__v');
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      };

      await redis.hSet(`user:${userId}`, 'data', JSON.stringify(user));
      await redis.expire(`user:${userId}`, 3600) //after 1hr it expires

      return res.status(200).json({
        sucess:true,
        user
      })
      
     } catch (error) {
      res.status(500).send({ error: error.message });
     }
  };



  const getAllUsers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const cacheKey = `users:page:${page}:limit:${limit}`;
      
      const cachedUsers = await redis.hGet(cacheKey, 'data');
                  
      if (cachedUsers) {
        return res.send(JSON.parse(cachedUsers));
      }
      
      const users = await User.find({})
        .select('-password -__v')
        .skip(skip)
        .limit(limit);
        
      const total = await User.countDocuments();
      
      const response = {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
      
      await redis.hSet(cacheKey, 'data', JSON.stringify(response));
      await redis.expire(cacheKey, 900);
      
      res.send(response);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  };

  export {
    register,
    login,
    refreshToken,
    logout,
    getUser,
    getAllUsers
  }