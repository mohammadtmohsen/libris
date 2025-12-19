import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import routes from './routes/index.js';
import './strategies/local-strategy.js';
import connectDB from './config/dbConnection.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser('cookieParser'));
  app.use(passport.initialize());
  app.use((req, res, next) => {
    connectDB().then(() => next()).catch(next);
  });
  app.use(routes);
  return app;
}
