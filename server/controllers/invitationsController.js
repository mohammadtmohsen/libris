import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { hashPassword } from '../utils/helper.js';

const DEFAULT_INVITE_PASSWORD = 'password';

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const plain = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password: _password, ...rest } = plain;
  return rest;
};

export const listInvitedUsers = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can view invited users' });
  }

  const [users, admins] = await Promise.all([
    User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean(),
    User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return res.json({ success: true, data: { users, admins } });
});

export const inviteUser = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can invite users' });
  }

  const { username, email, displayName, role } = req.body;

  const duplicateUser = await User.findOne({ username }).lean().exec();
  if (duplicateUser) {
    return res
      .status(409)
      .json({ success: false, error: 'User already exists' });
  }

  const user = await User.create({
    username,
    email,
    displayName: displayName || username,
    password: hashPassword(DEFAULT_INVITE_PASSWORD),
    role: role === 'admin' ? 'admin' : 'user',
  });

  return res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      defaultPassword: DEFAULT_INVITE_PASSWORD,
    },
  });
});

export const deleteInvitedUser = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can delete users' });
  }

  const user = await User.findById(req.params.id).lean();
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (user.role === 'admin' && String(user._id) === String(req.user._id)) {
    return res
      .status(400)
      .json({ success: false, error: 'You cannot delete your own admin account' });
  }

  await Progress.deleteMany({ owner: user._id });
  await User.deleteOne({ _id: user._id });

  return res.json({
    success: true,
    data: { id: user._id },
  });
});

export { DEFAULT_INVITE_PASSWORD };
