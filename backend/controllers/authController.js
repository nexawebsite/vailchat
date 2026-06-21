const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    const { username, phoneNumber, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { phoneNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username au namba ya simu tayari imesajiliwa.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      phoneNumber,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Usajili umekamilika kikamilifu!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'Namba ya simu au password sio sahihi.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Namba ya simu au password sio sahihi.' });
    }

    // Generate Token
    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretkey_vailnet',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            wallpaper: user.wallpaper,
            contacts: user.contacts
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
