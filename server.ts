/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const FLASK_PORT = 5001;
const isProduction = process.env.NODE_ENV === 'production';

let flaskProcess: ChildProcess | null = null;

function startFlaskBackend(): void {
  console.log('[*] Starting EmailGuard Python/Flask backend...');
  flaskProcess = spawn('python3', ['backend/app.py'], {
    cwd: __dirname,
    env: {
      ...process.env,
      FLASK_HOST: '127.0.0.1',
      FLASK_PORT: String(FLASK_PORT),
      PYTHONUNBUFFERED: '1',
    },
    stdio: 'inherit',
  });

  flaskProcess.on('error', (err) => {
    console.error('[-] Failed to start Flask process:', err);
  });

  flaskProcess.on('exit', (code, signal) => {
    console.log(`[!] Flask process exited with code ${code}, signal ${signal}`);
  });
}

// Clean up child process upon termination
process.on('SIGINT', () => {
  if (flaskProcess) flaskProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (flaskProcess) flaskProcess.kill();
  process.exit(0);
});

async function main() {
  startFlaskBackend();

  const app = express();

  // Forward all /api/* requests to Flask backend
  app.use('/api', (req: Request, res: Response) => {
    const targetUrl = `http://127.0.0.1:${FLASK_PORT}/api${req.url}`;
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: FLASK_PORT,
      path: `/api${req.url}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${FLASK_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.warn(`[Proxy Warning] Error forwarding to Flask (${req.url}):`, err.message);
      // If Flask is still booting, provide clean JSON retry response
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'Backend ML engine is initializing. Please retry in a moment.',
        });
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[+] EmailGuard full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[-] Server boot failure:', err);
  process.exit(1);
});
