const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      const parsedPathname = path.parse(pathname);

      if (parsedPathname.dir) {
        res.statusCode = 400;
        res.end('Incorrect path');
        return;
      }

      const limitSizeStream = new LimitSizeStream({limit: 1048576});
      const writableStream = fs.createWriteStream(filepath, {flags: 'wx'});

      writableStream.on('finish', () => {
        console.log(`writableStream finish`);
        res.statusCode = 201;
        res.end('File saved succesfully');
      });

      writableStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File already exist');
        } else {
          res.statusCode = 500;
          res.end('Server error');
        }
      });

      res.on('close', () => {
        if (!req.complete) {
          fs.unlink(filepath, () => {
            console.log(`File ${filepath} removed`);
          });
        }
      });

      limitSizeStream.on('error', (error) => {
        switch (error.code) {
          case 'LIMIT_EXCEEDED': {
            console.log(`File ${filepath} is too large`);
            res.statusCode = 413;
            res.end('File too large');
            // writableStream.close();
            break;
          }
          default: {
            res.statusCode = 500;
            res.end('Server error');
          }
        }
      });


      req.pipe(limitSizeStream).pipe(writableStream);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
