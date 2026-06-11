const db = require('../database/db');

const Follow = {
  toggle(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }
    
    const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
    let following = false;
    
    if (existing) {
      db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
    } else {
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, followingId);
      following = true;
    }
    
    const count = this.getFollowersCount(followingId);
    return { following, followers_count: count };
  },

  isFollowing(followerId, followingId) {
    const row = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
    return !!row;
  },

  getFollowers(userId) {
    return db.prepare(`
      SELECT users.id, users.username, users.full_name, users.avatar
      FROM follows
      JOIN users ON follows.follower_id = users.id
      WHERE follows.following_id = ?
    `).all(userId);
  },

  getFollowing(userId) {
    return db.prepare(`
      SELECT users.id, users.username, users.full_name, users.avatar
      FROM follows
      JOIN users ON follows.following_id = users.id
      WHERE follows.follower_id = ?
    `).all(userId);
  },

  getFollowersCount(userId) {
    const row = db.prepare('SELECT COUNT(*) AS count FROM follows WHERE following_id = ?').get(userId);
    return row ? row.count : 0;
  },

  getFollowingCount(userId) {
    const row = db.prepare('SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?').get(userId);
    return row ? row.count : 0;
  }
};

module.exports = Follow;
