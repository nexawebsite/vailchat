const Chat = require('../models/Chat');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { groupName, participants, creatorId } = req.body;
    
    // add creator to participants if not already
    if (!participants.includes(creatorId)) {
      participants.push(creatorId);
    }

    const newChat = new Chat({
      isGroup: true,
      groupName,
      participants
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username phoneNumber avatar')
      .sort({ updatedAt: -1 });
      
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
