import jwt from "jsonwebtoken"
import User from "../models/User.js"



const verifyauth = async(req,res, next) => {
    try {

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "No access token provided" });
        };

        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const user= await User.findOne({ _id: decoded._id });

        if (!user) {
           return res.status(404).json({message:'User not found'});
        };

        req.user=user;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
              message: 'Access token expired',
              shouldRefresh: true
            });
          }
          res.status(401).send({ error: error.message });
    }
} 

export default verifyauth;