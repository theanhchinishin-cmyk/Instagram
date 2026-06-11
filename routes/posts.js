const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const { ensureAuthenticated } = require('../config/auth');

// GET create post
router.get('/create', ensureAuthenticated, (req, res) => {
  res.render('create', {
    title: 'Create Post',
    cssFile: 'components.css' // we'll use base components styling
  });
});

// POST create post
router.post('/create', ensureAuthenticated, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Please upload an image.');
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    const caption = req.body.caption || '';
    
    const newPost = Post.create(req.user.id, imagePath, caption);
    
    // Get full post object for broadcasting
    const fullPost = Post.findById(newPost.id, req.user.id);
    fullPost.comments = [];
    
    // Broadcast via socket.io if available
    if (req.app.get('io')) {
      req.app.get('io').emit('new-post', fullPost);
    }
    
    res.redirect('/');
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST toggle like api
router.post('/api/like/:postId', ensureAuthenticated, (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const result = Post.like(req.user.id, postId);
    
    // Broadcast like count update
    if (req.app.get('io')) {
      req.app.get('io').emit('post-liked', {
        postId: postId,
        likes_count: result.likes_count
      });
    }
    
    res.json({
      success: true,
      liked: result.liked,
      likes_count: result.likes_count
    });
  } catch (err) {
    console.error('Like API error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST add comment api
router.post('/api/comment/:postId', ensureAuthenticated, (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Comment content cannot be empty' });
    }
    
    const newComment = Post.addComment(req.user.id, postId, content);
    
    // Broadcast new comment
    if (req.app.get('io')) {
      req.app.get('io').emit('post-commented', {
        postId: postId,
        comment: newComment
      });
    }
    
    res.json({
      success: true,
      comment: newComment
    });
  } catch (err) {
    console.error('Comment API error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
