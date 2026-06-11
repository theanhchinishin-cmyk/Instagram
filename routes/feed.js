const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const { ensureAuthenticated } = require('../config/auth');

// GET feed
router.get('/', ensureAuthenticated, (req, res) => {
  try {
    const posts = Post.getFeedPosts(req.user.id);
    
    // Add comments to each post
    for (const post of posts) {
      post.comments = Post.getComments(post.id, 5); // get top 5 comments
    }
    
    // Get suggested users to follow
    const suggestedUsers = User.getSuggestedUsers(req.user.id, 5);
    
    // Get users that current user is following for the stories rail
    const followingUsers = Follow.getFollowing(req.user.id);
    
    res.render('feed', {
      title: 'Feed',
      posts: posts,
      suggestedUsers: suggestedUsers,
      followingUsers: followingUsers,
      cssFile: 'feed.css'
    });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
