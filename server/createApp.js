import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import corsOptions from './config/corsOptions.js';
import routes from './routes/index.js';
import './strategies/local-strategy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser('cookieParser'));
  app.use(passport.initialize());
  app.use(routes);

  // Serve client build
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  return app;
}
