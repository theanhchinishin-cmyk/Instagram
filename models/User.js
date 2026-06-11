const db = require('../database/db');
const bcrypt = require('bcryptjs');

const User = {
  create(username, email, password, fullName) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    const info = db.prepare(`
      INSERT INTO users (username, email, password, full_name)
      VALUES (?, ?, ?, ?)
    `).run(username.toLowerCase().trim(), email.toLowerCase().trim(), hashedPassword, fullName.trim());
    
    return this.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare('SELECT id, username, email, full_name, bio, avatar, created_at FROM users WHERE id = ?').get(id);
  },

  findByUsername(username) {
    return db.prepare('SELECT id, username, email, password, full_name, bio, avatar, created_at FROM users WHERE LOWER(username) = LOWER(?)').get(username);
  },

  findByEmail(email) {
    return db.prepare('SELECT id, username, email, password, full_name, bio, avatar, created_at FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  },

  findByUsernameOrEmail(identifier) {
    return db.prepare(`
      SELECT id, username, email, password, full_name, bio, avatar, created_at 
      FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `).get(identifier, identifier);
  },

  updateProfile(id, { fullName, bio, avatar }) {
    if (avatar) {
      db.prepare(`
        UPDATE users 
        SET full_name = ?, bio = ?, avatar = ?
        WHERE id = ?
      `).run(fullName, bio, avatar, id);
    } else {
      db.prepare(`
        UPDATE users 
        SET full_name = ?, bio = ?
        WHERE id = ?
      `).run(fullName, bio, id);
    }
    return this.findById(id);
  },

  searchUsers(query, currentUserId) {
    return db.prepare(`
      SELECT id, username, full_name, avatar 
      FROM users 
      WHERE id != ? AND (username LIKE ? OR full_name LIKE ?)
      LIMIT 10
    `).all(currentUserId, `%${query}%`, `%${query}%`);
  },

  getSuggestedUsers(currentUserId, limit = 5) {
    // Select users that current user is NOT following, and not the user themselves
    return db.prepare(`
      SELECT id, username, full_name, avatar 
      FROM users 
      WHERE id != ? AND id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      ORDER BY RANDOM()
      LIMIT ?
    `).all(currentUserId, currentUserId, limit);
  }
};

module.exports = User;
