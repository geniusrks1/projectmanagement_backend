const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const isAuth = (req) => {
   

    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present

    if (!authHeader) {
        return false;
    }

    // Remove 'Bearer ' prefix if it exists, otherwise use the whole token
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7).trim() 
        : authHeader;

    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return true;
    }
    catch (error) {
        return false;
    }
}

module.exports = isAuth;