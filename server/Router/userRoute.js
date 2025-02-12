import { Router } from 'express';
const router = Router();
import { find, create, findOne } from '../Model/Usermodel.js';

router.get('/findUser', async (req, res) => {
  try {
    const users = await find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/createUser', async (req, res) => {
    let{username,email,password}=req.body;
  const user = create({
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
    const user = await findOne({ email });

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



export default router;
