// Add Express
const express = require("express");
// Initialize Express
const app = express();
const axios = require('axios');
const { createServer } = require('http');
const { Server } = require('socket.io');
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });


  io.on('connection', (socket) => {
    socket.on('sendnotification', (notification) => {
      io.emit('sendnotification', notification);
      pushnotification(notification);
      unseennotification(notification);
    });
    socket.on('offer', (offerId) => {
      io.emit('offer', offerId);
    });
    socket.on('received', (email) => {
      io.emit('received', email);
    });
    socket.on('new quote', (email) => {
      io.emit('new quote', email);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
  



// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.get("/test", (req, res) => {
    res.send({status: 'success'});
})
// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;