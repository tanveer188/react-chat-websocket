const express = require('express');
const router = express.Router();
const User = require('../Model/Usermodel');

router.get('/findUser', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/createUser', async (req, res) => {
    let{username,email,password}=req.body;
  const user = User.create({
    username,
    email,
    password
  });

  try {
    res.status(201).json({
        message:true,
        user:user});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(201).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
