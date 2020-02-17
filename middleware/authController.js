require('dotenv').config();
const jwt = require('jsonwebtoken')

const isAuthenticated = (req, res, next) => {
    const header = req.headers['authorization'];
    if(typeof header === 'undefined') {
        res.status(403).send("Protected Route. Please provide appropriate headers.");
    }
    
    try {
        const bearer = header.split(' ');
        const token = bearer[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.token = decoded;
        next();
    } catch(err) {
        res.status(401).send("Unauthorized. " + err)
    }
}

module.exports = isAuthenticated;