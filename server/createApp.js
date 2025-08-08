import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import routes from './routes/index.js';
import corsOptions from './config/corsOptions.js';
import './strategies/local-strategy.js';

export function createApp() {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser('cookieParser'));
  app.use(passport.initialize());
  app.use(routes);
  return app;
}
