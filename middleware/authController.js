const jwt = require('jsonwebtoken')

const isAuthenticated = (req, res, next) => {
    const header = req.headers['authorization'];
    if(typeof header === 'undefined') 
        res.status(403).send("Invalid and/or No headers.");

    try {
        const bearer = header.split(' ');
        const token = bearer[1]; 
        const decoded = jwt.verify(token, 'splititAPI');
        req.token = decoded;
        next();
    } catch(err) {
        res.status(403).send("Unauthorized. " + err)
    }
}

module.exports = isAuthenticated;