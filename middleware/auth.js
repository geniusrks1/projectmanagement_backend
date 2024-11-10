const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { promisify } = require('util');
const {User}=require('../schema/user.schema');
dotenv.config();



// const authMiddleware = (req, res, next) => {

//     const authHeader = req.headers.authorization;

//     // Check if the Authorization header is present
//     if (!authHeader) {
//         return res.status(401).json({ message: "User is not logged in" });
//     }

//     // Remove 'Bearer ' prefix if it exists, otherwise use the whole token
//     const token = authHeader.startsWith('Bearer ') 
//         ? authHeader.slice(7).trim() 
//         : authHeader;



//     // const token = req.headers.authorization;
//     // console.log(token);
//     // if (!token) {
//     //     return res.status(401).json({ message: "User is not logged in" });
//     // }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.id;
//         next();
//     }
//     catch (error) {
//         res.status(401).json({ message: "User is not logged in" });
//     }
// }




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
    //   console.log(token);
     
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  
    // console.log(decoded);

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
      res.status(500).json({
        status: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
    }
  };



module.exports = protectedMiddleware;