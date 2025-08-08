import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Initiate Google OAuth flow
 */
router.get('/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(authUrl);
});

/**
 * Handle OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in session or database
    req.session.googleTokens = tokens;

    res.json({
      success: true,
      message: 'Authentication successful',
      tokens: tokens,
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
