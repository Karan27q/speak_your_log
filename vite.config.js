import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import followup from './api/followup.js';

function localApi() {
  return {
    name: 'speak-your-log-local-api',
    configureServer(server) {
      server.middlewares.use('/api/followup', async (request, response, next) => {
        if (request.method !== 'POST') return next();
        try {
          const chunks = [];
          for await (const chunk of request) chunks.push(chunk);
          request.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          let statusCode = 200;
          const adapter = {
            status(code) { statusCode = code; return this; },
            json(payload) {
              response.statusCode = statusCode;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify(payload));
            },
          };
          await followup(request, adapter);
        } catch {
          response.statusCode = 400;
          response.end(JSON.stringify({ error: 'Invalid request.' }));
        }
      });
    },
  };
}

export default defineConfig({ plugins: [react(), localApi()] });
