//D:\Astro-main\main-backend\middleware\jwtMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes by verifying a JSON Web Token (JWT).
 * It expects a token in the 'Authorization' header with the 'Bearer' scheme.
 */
const jwtProtect = (req, res, next) => {
  let token;

  // 1. Check if the Authorization header is present and correctly formatted
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using the secret key from your environment variables.
      // jwt.verify will throw an error if the token is invalid (e.g., expired, wrong signature).
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach the decoded payload (which should contain user info like UID)
      // to the request object so subsequent route handlers can access it.
      req.user = {
        uid: decoded.uid,
      };

      // 5. If the token is valid, proceed to the next middleware or route handler.
      next();
    } catch (error) {
      // If token verification fails, log the error for debugging and send a 401 Unauthorized response.
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token is found in the header, or it's malformed, send a 401 Unauthorized response.
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { jwtProtect };
