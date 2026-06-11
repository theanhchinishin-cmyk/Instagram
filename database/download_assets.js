const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const assets = [
  {
    name: 'home-phones.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/home-phones.png'
  },
  {
    name: 'screenshot1.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/screenshot1.png'
  },
  {
    name: 'screenshot2.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/screenshot2.png'
  },
  {
    name: 'screenshot3.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/screenshot3.png'
  },
  {
    name: 'screenshot4.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/screenshot4.png'
  },
  {
    name: 'appstore.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/appstore.png'
  },
  {
    name: 'playstore.png',
    url: 'https://raw.githubusercontent.com/khadkamhn/instagram-clone/master/public/images/playstore.png'
  }
];

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {});
    if (cb) cb(err.message);
  });
}

console.log('Downloading static assets...');
let completed = 0;

assets.forEach(asset => {
  const destPath = path.join(assetsDir, asset.name);
  download(asset.url, destPath, (err) => {
    if (err) {
      console.error(`Failed to download ${asset.name}: ${err}`);
    } else {
      console.log(`Successfully downloaded ${asset.name}`);
    }
    completed++;
    if (completed === assets.length) {
      console.log('All downloads finished!');
    }
  });
});
