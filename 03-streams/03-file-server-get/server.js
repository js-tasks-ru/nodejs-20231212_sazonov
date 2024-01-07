const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  switch (req.method) {
    case 'GET':
      const pathname = url.pathname.slice(1);

      const filepath = path.join(__dirname, 'files', pathname);
      const parsedPathname = path.parse(pathname);

      if (parsedPathname.dir) {
        res.statusCode = 400;
        res.end('Incorrect path');
      }

      const stream = fs.createReadStream(filepath);
      stream.pipe(res);

      stream.on('error', (error) => {
        if (error.code == 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          res.statusCode = 500;
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
