const db = require('../database/db');

const Post = {
  create(userId, imagePath, caption) {
    const info = db.prepare(`
      INSERT INTO posts (user_id, image_path, caption)
      VALUES (?, ?, ?)
    `).run(userId, imagePath, caption);
    return this.findById(info.lastInsertRowid);
  },

  findById(postId, currentUserId = null) {
    const isLikedSub = currentUserId 
      ? `, EXISTS(SELECT 1 FROM likes WHERE user_id = ${currentUserId} AND post_id = posts.id) AS is_liked` 
      : `, 0 AS is_liked`;

    return db.prepare(`
      SELECT posts.*, users.username, users.full_name, users.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count
             ${isLikedSub}
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `).get(postId);
  },

  getFeedPosts(userId, limit = 20, offset = 0) {
    // Select posts of users followed by the current user, or the user's own posts
    return db.prepare(`
      SELECT posts.*, users.username, users.full_name, users.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count,
             EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = posts.id) AS is_liked
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = ? OR posts.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, userId, userId, limit, offset);
  },

  getExplorePosts(userId, limit = 30) {
    // Select recent posts not by user, ordered by likes count, then date
    return db.prepare(`
      SELECT posts.*, users.username, users.full_name, users.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count,
             EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = posts.id) AS is_liked
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id != ?
      ORDER BY likes_count DESC, posts.created_at DESC
      LIMIT ?
    `).all(userId, userId, limit);
  },

  getUserPosts(userId) {
    return db.prepare(`
      SELECT posts.*, 
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count
      FROM posts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);
  },

  like(userId, postId) {
    // Check if like exists
    const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId);
    let liked = false;
    
    if (existing) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
    } else {
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
      liked = true;
    }
    
    const count = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?').get(postId).count;
    return { liked, likes_count: count };
  },

  addComment(userId, postId, content) {
    const info = db.prepare(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (?, ?, ?)
    `).run(userId, postId, content);
    
    // Fetch comment with user info
    return db.prepare(`
      SELECT comments.*, users.username, users.avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?
    `).get(info.lastInsertRowid);
  },

  getComments(postId, limit = 50) {
    return db.prepare(`
      SELECT comments.*, users.username, users.avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
      LIMIT ?
    `).all(postId, limit);
  },

  getGlobalFeed(userId, limit = 30, offset = 0) {
    return db.prepare(`
      SELECT posts.*, users.username, users.full_name, users.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count,
             EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = posts.id) AS is_liked
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
  },

  searchPosts(query, userId) {
    return db.prepare(`
      SELECT posts.*, users.username, users.full_name, users.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comments_count,
             EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = posts.id) AS is_liked
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.caption LIKE ?
      ORDER BY posts.created_at DESC
    `).all(userId, `%${query}%`);
  }
};

module.exports = Post;
