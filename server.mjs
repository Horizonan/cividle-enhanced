import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file,(err,data) => { if(err){res.writeHead(404);res.end('Not found');return;} res.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'})[path.extname(file)] || 'application/octet-stream'); res.end(data); });
});
const port = Number(process.argv[2] || 4173);
server.listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:' + port));
