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

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat room: ${chatId}`);
    });

    // 2. Real-time Text Messaging (Room Based)
    socket.on('send_message', async (data) => {
      try {
        const { senderId, chatId, content, type } = data;
        
        // Save to DB
        const newMessage = new Message({
          senderId,
          chatId,
          content,
          type
        });
        await newMessage.save();

        const fullMessage = await Message.findById(newMessage._id).populate("senderId", "username avatar phoneNumber");

        // Broadcast to the chat room
        socket.to(chatId).emit('receive_message', fullMessage);

        // Send confirmation back to sender
        socket.emit('message_sent', fullMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // 2.5 Message Status Updates (Delivered, Read)
    socket.on('update_message_status', async (data) => {
      try {
        const { messageIds, status, chatId } = data; // status: 'delivered' | 'read'
        
        if (!messageIds || messageIds.length === 0) return;

        // Update in DB
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { status: status } }
        );

        // Broadcast to chat room so sender sees the ticks change
        socket.to(chatId).emit('message_status_updated', {
          messageIds,
          status,
          chatId
        });
      } catch (error) {
        console.error('Error updating message status:', error);
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

    // 4. New Chat/Group Created
    socket.on('new_chat_created', (data) => {
      const { chat, participants } = data;
      
      if (participants && Array.isArray(participants)) {
        participants.forEach(userId => {
          // Send to all participants except the sender (who already added it)
          const receiverSocketId = connectedUsers.get(userId.toString());
          if (receiverSocketId && receiverSocketId !== socket.id) {
            io.to(receiverSocketId).emit('chat_added', chat);
          }
        });
      }
    });

    // 5. Handle Disconnect
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
