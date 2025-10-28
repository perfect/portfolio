const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Login (using fixed password from env, no database needed)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fixed credentials from environment
    const adminUsername = 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      // Create token without database
      const token = jwt.sign(
        { userId: 1, username: adminUsername },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: 1, username: adminUsername } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

module.exports.router = router;
module.exports.verifyToken = verifyToken;

