import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  displayName: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    notEmpty: true,
    type: mongoose.Schema.Types.String,
    required: true,
  },
  email: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
}, { versionKey: false }); // This will remove the __v field

const User = mongoose.model('User', UserSchema);

export default User;
