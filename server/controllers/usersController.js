import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { hashPassword } from '../utils/helper.js';

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  if (!users) {
    res.status(404).json({ message: 'No users found' });
  }
  return res.status(200).json({ users });
});

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-password').lean().exec();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ user });
};

const createNewUser = async (req, res) => {
  const { displayName, username, password, email } = req.body;

  // Check if user already exists
  const duplicateUser = await User.findOne({ username }).lean().exec();
  if (duplicateUser) {
    res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = hashPassword(password);

  const userObj = {
    displayName,
    username,
    password: hashedPassword,
    email,
  };

  const user = await User.create(userObj);
  if (!user) {
    res.status(400).json({ message: 'User not created' });
  } else {
    res
      .status(201)
      .json({ user, message: `New User ${username} created successfully` });
  }
};

const updateUser = async (req, res) => {
  const {
    params: { id },
    body: { displayName, username, password, email },
  } = req;

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // check for dubplicate username
  const duplicateUser = await User.findOne({ id }).lean().exec();
  // allow user to update their own profile
  if (duplicateUser && duplicateUser._id.toString() !== id) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = hashPassword(password);

  user.displayName = displayName;
  user.username = username;
  user.password = hashedPassword;
  user.email = email;

  const updatedUser = await user.save();
  res.status(200).json({
    updatedUser,
    message: `User ${username} updated successfully`,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Please provide user id' });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const result = await user.deleteOne();

  const reply = `User ${user?.username} with ID: ${id} deleted successfully`;

  res.status(200).json({ result, message: reply });
};

export { getAllUsers, getUserById, createNewUser, updateUser, deleteUser };
