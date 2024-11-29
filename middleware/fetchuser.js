var jwt = require('jsonwebtoken'); 
const JWT_SECRETE = "abcd";

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Access denied. No token provided" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRETE);
        req.user = data.user;
        next();
        
    } catch (error) {
        res.status(401).send({ message: "Access denied. No token provided." });
    }

}


module.exports = fetchuser;
