const path = require('node:path');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;
const staticDir = path.join(__dirname, 'dist', 'web', 'browser');

app.disable('x-powered-by');

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express on a Chainguard image!', node: process.version });
});

app.get('/healthz', (_req, res) => res.send('ok'));

app.use(express.static(staticDir));

// SPA fallback: send index.html for any other GET request.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(staticDir, 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
