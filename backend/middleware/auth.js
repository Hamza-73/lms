// middleware/authenticateUser.js
const jwt = require('jsonwebtoken');
const JWT_KEY = 'hamzakhan1';

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded; // Assuming the payload contains the user details
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateUser;
