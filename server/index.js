// Load environment variables from .env file BEFORE any other imports execute
import 'dotenv/config';

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './createApp.js';
import connectDB from './config/dbConnection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = createApp();
const PORT = process.env.PORT || 5051;

const certPath = path.join(__dirname, 'tls.crt');
const keyPath = path.join(__dirname, 'tls.key');

connectDB()
  .then(() => {
    // Start HTTPS server if certs exist
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const httpsServer = https.createServer(
        { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) },
        app
      );
      httpsServer.listen(8443, '0.0.0.0', () => {
        console.log('HTTPS server listening on port 8443');
      });
    } else {
      console.log('No TLS certs found, starting HTTP only');
    }

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`HTTP server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
