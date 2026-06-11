const db = require('../database/db');

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const user = db.prepare('SELECT id, username, email, full_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
        return next();
      }
    } catch (err) {
      console.error('Auth middleware error:', err);
    }
  }
  
  // If API request, send 401, otherwise redirect to login
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login');
}

function checkGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
}

module.exports = {
  ensureAuthenticated,
  checkGuest
};
