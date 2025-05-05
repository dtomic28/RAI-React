const jwt = require("jsonwebtoken");

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"

  // If there's no token, send an error
  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }
    // Attach the decoded user information to the request object
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

module.exports = authMiddleware;
