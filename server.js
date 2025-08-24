// Simple static file server using Bun
// Run with: bun server.js

function mimeType(p) {
  if (p.endsWith('.html')) return 'text/html; charset=utf-8';
  if (p.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (p.endsWith('.css')) return 'text/css; charset=utf-8';
  if (p.endsWith('.json')) return 'application/json; charset=utf-8';
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
  if (p.endsWith('.svg')) return 'image/svg+xml';
  if (p.endsWith('.ico')) return 'image/x-icon';
  if (p.endsWith('.txt')) return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

const path = require('path');

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    // prevent path traversal
    if (pathname.includes('..')) return new Response('Forbidden', { status: 403 });
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.join(process.cwd(), pathname);
    try {
      const file = Bun.file(filePath);
      const headers = {
        'Content-Type': mimeType(filePath),
      };
      return new Response(file, { status: 200, headers });
    } catch (err) {
      return new Response('Not Found', { status: 404 });
    }
  }
});

console.log(`Bun static server running at http://localhost:${server.port}/`);
