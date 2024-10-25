const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present
    if (!authHeader) {
        return res.status(401).json({ message: "User is not logged in" });
    }

    // Remove 'Bearer ' prefix if it exists, otherwise use the whole token
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7).trim() 
        : authHeader;



    // const token = req.headers.authorization;
    // console.log(token);
    // if (!token) {
    //     return res.status(401).json({ message: "User is not logged in" });
    // }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "User is not logged in" });
    }
}

module.exports = authMiddleware;