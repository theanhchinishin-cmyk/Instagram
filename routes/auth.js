const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { checkGuest } = require('../config/auth');

// GET login
router.get('/login', checkGuest, (req, res) => {
  res.render('auth/login', { error: null });
});

// POST login
router.post('/login', checkGuest, (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.render('auth/login', { error: 'Please fill in all fields' });
  }
  
  try {
    const user = User.findByUsernameOrEmail(identifier);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username/email or password' });
    }
    
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid username/email or password' });
    }
    
    // Set session
    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', { error: 'An error occurred. Please try again.' });
  }
});

// GET register
router.get('/register', checkGuest, (req, res) => {
  res.render('auth/register', { error: null });
});

// POST register
router.post('/register', checkGuest, (req, res) => {
  const { email, fullName, username, password } = req.body;
  
  if (!email || !fullName || !username || !password) {
    return res.render('auth/register', { error: 'Please fill in all fields' });
  }
  
  // Basic validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return res.render('auth/register', { error: 'Username must be 3-30 characters, alphanumeric or underscores' });
  }
  
  if (password.length < 6) {
    return res.render('auth/register', { error: 'Password must be at least 6 characters' });
  }
  
  try {
    // Check if user exists
    const emailExists = User.findByEmail(email);
    if (emailExists) {
      return res.render('auth/register', { error: 'Email is already registered' });
    }
    
    const usernameExists = User.findByUsername(username);
    if (usernameExists) {
      return res.render('auth/register', { error: 'Username is already taken' });
    }
    
    // Create user
    User.create(username, email, password, fullName);
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('auth/register', { error: 'An error occurred. Please try again.' });
  }
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
