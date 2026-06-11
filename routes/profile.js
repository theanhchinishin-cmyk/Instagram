const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const upload = require('../middleware/upload');
const { ensureAuthenticated } = require('../config/auth');

// GET profile
router.get('/profile/:username', ensureAuthenticated, (req, res) => {
  try {
    const profileUser = User.findByUsername(req.params.username);
    if (!profileUser) {
      return res.status(404).send('User not found');
    }
    
    // Get posts by profile user
    const posts = Post.getUserPosts(profileUser.id);
    
    // Get stats
    const postsCount = posts.length;
    const followersCount = Follow.getFollowersCount(profileUser.id);
    const followingCount = Follow.getFollowingCount(profileUser.id);
    
    // Check if current user is following this user
    const isFollowing = Follow.isFollowing(req.user.id, profileUser.id);
    
    // Check if it is current user's profile
    const isOwnProfile = req.user.id === profileUser.id;
    
    res.render('profile', {
      title: `@${profileUser.username}`,
      profileUser: profileUser,
      posts: posts,
      postsCount: postsCount,
      followersCount: followersCount,
      followingCount: followingCount,
      isFollowing: isFollowing,
      isOwnProfile: isOwnProfile,
      cssFile: 'profile.css'
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET edit profile
router.get('/profile/:username/edit', ensureAuthenticated, (req, res) => {
  if (req.params.username !== req.user.username) {
    return res.redirect(`/profile/${req.user.username}/edit`);
  }
  
  res.render('edit-profile', {
    title: 'Edit Profile',
    cssFile: 'components.css'
  });
});

// POST edit profile
router.post('/profile/:username/edit', ensureAuthenticated, upload.single('avatar'), (req, res) => {
  if (req.params.username !== req.user.username) {
    return res.status(403).send('Forbidden');
  }
  
  try {
    const { fullName, bio } = req.body;
    let avatarPath = null;
    
    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`;
    }
    
    User.updateProfile(req.user.id, {
      fullName: fullName,
      bio: bio,
      avatar: avatarPath
    });
    
    res.redirect(`/profile/${req.user.username}`);
  } catch (err) {
    console.error('Edit profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST toggle follow API
router.post('/api/follow/:userId', ensureAuthenticated, (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot follow yourself' });
    }
    
    const result = Follow.toggle(req.user.id, targetUserId);
    
    res.json({
      success: true,
      following: result.following,
      followers_count: result.followers_count
    });
  } catch (err) {
    console.error('Follow API error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
