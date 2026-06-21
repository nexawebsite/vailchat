const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Find messages where sender is userId and receiver is otherUserId OR vice versa
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }); // Sort by chronological order

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
