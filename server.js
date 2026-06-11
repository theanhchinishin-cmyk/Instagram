require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database/db');
require('./database/seed')();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Save socket.io instance in express app
app.set('io', io);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'instagram_clone_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Time formatting helper
app.use((req, res, next) => {
  res.locals.formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).toUpperCase();
  };
  next();
});

// Middleware to inject currentUser
const User = require('./models/User');
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
      } else {
        res.locals.currentUser = null;
      }
    } catch (err) {
      console.error('Session user injection error:', err);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');
const postsRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');
const exploreRoutes = require('./routes/explore');

app.use('/', authRoutes);
app.use('/', feedRoutes);
app.use('/', postsRoutes);
app.use('/', profileRoutes);
app.use('/', exploreRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  // Join room by userId if authenticated
  socket.on('register-user', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    // Left empty
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Instagram Clone running at http://localhost:${PORT}`);
});
