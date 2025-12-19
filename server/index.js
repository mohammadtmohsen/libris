// Load environment variables from .env file BEFORE any other imports execute
import 'dotenv/config';
import { createApp } from './createApp.js';
import connectDB from './config/dbConnection.js';

const app = createApp();
const PORT = process.env.PORT || 5050;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

export default app;
