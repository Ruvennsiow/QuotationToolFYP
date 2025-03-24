const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// User login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Login attempt for username: ${username}`);
      
      // Query the user
      console.log(`Querying database for username: ${username}`);
      const [rows] = await pool.query('SELECT * FROM login WHERE username = ?', [username]);
      console.log(`Found ${rows.length} matching users`);
      
      if (rows.length === 0) {
        console.log(`No user found with username: ${username}`);
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      const user = rows[0];
      console.log(`User found: ${user.username}, ID: ${user.id}`);
      
      // Compare passwords directly as strings (for plain text passwords)
      console.log('Comparing passwords as plain text...');
      const passwordMatch = (password === user.password);
      console.log(`Password match result: ${passwordMatch}`);
      
      if (!passwordMatch) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      console.log('Password matches, generating token');
      
      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not set!');
        // Use a default secret if environment variable is not set
        process.env.JWT_SECRET = 'default_secret_key_for_development';
        console.log('Using default JWT_SECRET for development');
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      console.log('Login successful, sending response');
      res.json({ 
        success: true,
        token, 
        user: { id: user.id, username: user.username } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: error.message 
      });
    }
  });

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if username already exists
    const [existingUsers] = await pool.query('SELECT * FROM login WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    await pool.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email FROM login WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const [rows] = await pool.query('SELECT * FROM login WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = rows[0];
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE login SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;