import dotenv from 'dotenv';
import connectDB from './config/dbConnection.js';
import { createApp } from './createApp.js';

// Load environment variables from .env file
dotenv.config();

connectDB();

const app = createApp();

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
