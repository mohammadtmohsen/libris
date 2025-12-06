import passport from 'passport';
import { Strategy } from 'passport-local';
import User from '../models/User.js';
import { comparePassword } from '../utils/helper.js';

export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).lean().exec();

      if (!user) {
        return done(null, false, { message: 'User Not Found' });
      }

      const isPasswordMatch = await comparePassword(password, user.password);

      if (!isPasswordMatch) {
        return done(null, false, { message: 'Invalid Credential' });
      }
      const userWithoutPassword = {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role || 'user',
      };

      // Add more debugging to verify user object structure
      console.log('User authenticated:', userWithoutPassword);

      return done(null, userWithoutPassword);
    } catch (error) {
      console.error('Authentication error:', error);
      return done(error, false);
    }
  })
);
