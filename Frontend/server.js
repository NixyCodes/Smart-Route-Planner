const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT   = process.env.PORT || 3001;
const PREFIX = '/skyroute-html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Strip prefix
  if (url.startsWith(PREFIX)) url = url.slice(PREFIX.length);
  if (!url || url === '/') url = '/index.html';

  const filePath = path.join(__dirname, url);
  const ext      = path.extname(filePath).toLowerCase();
  const mime     = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 – ' + url);
    } else {
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
}).listen(PORT, () => console.log(`✈  SkyRoute Website → http://localhost:${PORT}${PREFIX}/`));
