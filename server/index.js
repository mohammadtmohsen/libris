// Load environment variables from .env file BEFORE any other imports execute
import 'dotenv/config';
import connectDB from './config/dbConnection.js';
import { createApp } from './createApp.js';

connectDB();

const app = createApp();

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
