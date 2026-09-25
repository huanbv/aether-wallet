import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * AetherWallet dev/preview host.
 *
 * NOTE: This server holds NO secrets. Transaction security analysis (the Gemini
 * "Transaction Guard") now runs fully client-side using the user's own API key
 * (BYOK), called directly from the wallet to Google — nothing passes through
 * here. This process only serves the static single-page app (required so the
 * AI Studio / Cloud Run runtime has a process listening on $PORT). For the
 * packaged Chrome extension, the popup is loaded directly and this host is not
 * used at all.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'AetherWallet static host', timestamp: Date.now() });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AetherWallet] Static host running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
