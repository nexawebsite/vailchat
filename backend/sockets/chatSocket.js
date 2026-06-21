const Message = require('../models/Message');

module.exports = (io) => {
  // Store connected users. Map: userId -> socketId
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. User Joins System
    socket.on('user_join', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ${socket.id}`);
      
      // Emit online status to others
      io.emit('user_online', userId);
    });

    // 2. Real-time Text Messaging
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content, type } = data;
        
        // Save to DB
        const newMessage = new Message({
          senderId,
          receiverId,
          content,
          type
        });
        await newMessage.save();

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', newMessage);
        }

        // Send confirmation back to sender
        socket.emit('message_sent', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // 3. WebRTC Signaling for Voice/Video Calls
    // Caller sends call request
    socket.on('call_user', (data) => {
      const { userToCall, signalData, from, name, callType } = data;
      const receiverSocketId = connectedUsers.get(userToCall);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call_incoming', {
          signal: signalData,
          from,
          name,
          callType
        });
      }
    });

    // Receiver answers call
    socket.on('answer_call', (data) => {
      const { to, signal } = data;
      const callerSocketId = connectedUsers.get(to);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_accepted', signal);
      }
    });

    // End call
    socket.on('end_call', (data) => {
      const { to } = data;
      const otherSocketId = connectedUsers.get(to);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit('call_ended');
      }
    });

    // 4. Handle Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      let disconnectedUserId = null;
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          connectedUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit('user_offline', disconnectedUserId);
      }
    });
  });
};
