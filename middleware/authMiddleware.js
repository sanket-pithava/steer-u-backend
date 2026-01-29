//D:\Astro-main\main-backend\middleware\authMiddleware.js
const admin = require('firebase-admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
      // Get token from header
        token = req.headers.authorization.split(' ')[1];

      // Verify token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
      // Attach user to the request
        req.user = decodedToken;
    
        next();
    } catch (error) {
        console.error('Error while verifying token:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
}
};

module.exports = { protect };