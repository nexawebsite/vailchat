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
      participants,
      groupAdmins: [creatorId] // creator becomes admin
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
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
      
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.accessChat = async (req, res) => {
  const { userId, otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "UserId and otherUserId parameters are required" });
  }

  try {
    // Check if a 1-on-1 chat already exists between these two users
    let isChat = await Chat.find({
      isGroup: false,
      $and: [
        { participants: { $elemMatch: { $eq: userId } } },
        { participants: { $elemMatch: { $eq: otherUserId } } }
      ]
    }).populate('participants', '-password').populate('lastMessage');

    if (isChat.length > 0) {
      res.status(200).json(isChat[0]);
    } else {
      // Create a new 1-on-1 chat
      var chatData = {
        isGroup: false,
        participants: [userId, otherUserId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('participants', '-password');
      res.status(200).json(FullChat);
    }
  } catch (error) {
    console.error('Error accessing chat:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.renameGroup = async (req, res) => {
  const { chatId, chatName, adminId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    if (!chat.groupAdmins.includes(adminId)) return res.status(403).json({ message: "Only admins can rename group" });

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName: chatName },
      { new: true }
    ).populate("participants", "-password").populate("groupAdmins", "-password");

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromGroup = async (req, res) => {
  const { chatId, userIdToRemove, adminId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    // Allow users to leave, or admins to remove others
    if (!chat.groupAdmins.includes(adminId) && userIdToRemove !== adminId) {
      return res.status(403).json({ message: "Only admins can remove someone" });
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: userIdToRemove, groupAdmins: userIdToRemove } },
      { new: true }
    ).populate("participants", "-password").populate("groupAdmins", "-password");

    res.json(removed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToGroup = async (req, res) => {
  const { chatId, userIdToAdd, adminId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    if (!chat.groupAdmins.includes(adminId)) return res.status(403).json({ message: "Only admins can add to group" });

    if (chat.participants.includes(userIdToAdd)) {
       return res.status(400).json({ message: "User already in group" });
    }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { participants: userIdToAdd } },
      { new: true }
    ).populate("participants", "-password").populate("groupAdmins", "-password");

    res.json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
