import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const login = async (req, res) => {
  const user = req.user;

  try {
    // Add detailed debugging to see what's coming into the controller
    console.log('Login attempt - Request user object:', user);

    if (!user) {
      console.error('User not found in request');
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create access token - short lived
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Create refresh token - longer lived
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Log the response we're sending back
    console.log('Login successful - Sending response with token and user');

    res.status(200).json({
      accessToken,
      refreshToken,
      user: req.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Generate a new refresh token
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log('Token refreshed for user:', user._id);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res
      .status(401)
      .json({ message: 'Invalid refresh token', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    // In a real implementation with server-side token tracking,
    // you would invalidate the token here

    // For now, we'll just return a successful response
    // Client-side will handle removing tokens from storage

    console.log('User logged out successfully');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { login, refreshTokenHandler, logout };
