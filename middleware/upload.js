const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Copy default avatar if it doesn't exist
const defaultAvatarPath = path.join(uploadDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Let's create a very simple 1x1 png or just a placeholder SVG.
  // Wait, EJS/HTML can load an SVG or a default image. We can write a simple SVG or a basic grey circle as default-avatar.png.
  // Let's write a standard default-avatar.png.
  // Since we can't easily write a complex png from raw bytes without libraries, we can just write an SVG or an empty file,
  // or we can use a base64 string of a tiny grey circle. Let's write a small grey circle png base64 to file.
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAADipQCJAAAAMFBMVEVHcEz///////////////////////////////////////////////////////////////99Uv1OAAAADnRSTlMAESIzRFVmd4iZqru8zM+T09YAAAEJSURBVHja7dEBCAMxDAOx87L737elGyh0tPc5yA+C5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH9qZu6u2t27Z+bu6t0mYJ4GgGfupQ7Q+6pD5F60D6B1gL4D9L4A6B1A6wD6XwD0DqB1AP0vAHoH0DqA/hUAfQP0HcD+B2A+B5ivAfY/APM5wHwNsP8BmBcAvQOwDwD7ALAPAPsAsA8A+wCwDwD7ALAPAPsA+ACwDwD7APgAsA+ADwD7APgAsA+ADwD7ALAPAPsAsA8A+wCwDwD7ALAPAPsAsA8A+wD4ALAPgA8A+wD4ALAPgA8A+wCwDwD7APgHsC8A+wD4B7AvAPsC+Adg/wG82gO0qK07bQAAAABJRU5ErkJggg==';
  fs.writeFileSync(defaultAvatarPath, Buffer.from(base64Png, 'base64'));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
