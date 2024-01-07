const url = require('url');
const http = require('http');
const path = require('path');
const fs = require("fs");

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const parsedPathname = path.parse(pathname);

  if (parsedPathname.dir) {
    res.statusCode = 400;
    res.end('Incorrect path');
    return;
  }

  try {
    if (!fs.existsSync(filepath)) {
      res.statusCode = 404;
      res.end('File does not exists');
      return;
    }
  } catch (err) {
    res.statusCode = 500;
    res.end('Server error');
    return;
  }

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, () => {
        res.statusCode = 200;
        res.end('File deleted');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
