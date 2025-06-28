const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        //const token = req.cookies.token;
        const token = req.headers["authorization"].split(" ")[1]

        if(!token){
            return res.status(401).send({message: "Invalid token"})
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if(!decoded){
            return res.status(401).send({message: "Invalid token "})
        }
        req.UserId = decoded.UserId;
        req.role = decoded.role;
        next();

        //console.log(token)
    }   catch (error) {
        console.error('Error while verifying token', error);
        req.status(401).send({message: 'Error while verifying token'})
    }
}
module.exports = verifyToken;