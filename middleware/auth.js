const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { promisify } = require('util');
const {User}=require('../schema/user.schema');
dotenv.config();


 const protectedMiddleware = async (req, res, next) => {

    try {   
      const { authorization } = req.headers;
  
      if (!authorization) {
        return res.status(401).json({
          status: 'error',
          message: 'Please login to access this route',
        });
      }
  
  
      const token = authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token format. Please login to access this route.',
        });
      }
  
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  
      const user = await User.findOne({ _id: decoded.id });
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User does not exist. Please login again.',
        });
      }
  
     
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in protectedMiddleware:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
    }
  };



module.exports = protectedMiddleware;