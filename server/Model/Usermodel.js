import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

export const find = () => {
  return User.find();
};

export const create = (userData) => {
  const user = new User(userData);
  return user.save();
};

export const findOne = (query) => {
  return User.findOne(query);
};

