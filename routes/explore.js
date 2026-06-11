const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

// GET explore page (global feed / popular posts)
router.get('/explore', ensureAuthenticated, (req, res) => {
  try {
    const posts = Post.getExplorePosts(req.user.id);
    
    res.render('explore', {
      title: 'Explore',
      posts: posts,
      users: null,
      query: '',
      cssFile: 'profile.css' // Profile grid layout works for explore too
    });
  } catch (err) {
    console.error('Explore page error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET explore search
router.get('/explore/search', ensureAuthenticated, (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.trim() === '') {
      return res.redirect('/explore');
    }
    
    const users = User.searchUsers(query, req.user.id);
    const posts = Post.searchPosts(query, req.user.id);
    
    res.render('explore', {
      title: `Search: ${query}`,
      posts: posts,
      users: users,
      query: query,
      cssFile: 'profile.css'
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
