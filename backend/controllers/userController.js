const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    // Return all users except passwords
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { userId, avatar, wallpaper } = req.body;
    const updateData = {};
    if (avatar) updateData.avatar = avatar;
    if (wallpaper) updateData.wallpaper = wallpaper;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { userId, phoneNumber, name } = req.body;
    
    // Validate if the phone number exists in the system
    const contactUser = await User.findOne({ phoneNumber });
    if (!contactUser) {
      return res.status(404).json({ message: 'Namba hii haijasajiliwa kwenye Vailnet' });
    }

    const user = await User.findById(userId);
    // Check if contact already exists
    const exists = user.contacts.find(c => c.phoneNumber === phoneNumber);
    if (!exists) {
      user.contacts.push({ phoneNumber, name });
      await user.save();
    }

    res.status(200).json({ message: 'Mtu ameongezwa', contacts: user.contacts });
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
