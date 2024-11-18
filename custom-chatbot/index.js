const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { NlpManager } = require('node-nlp');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const manager = new NlpManager({ languages: ['en', 'hi'], autoSave: false, autoLoad: false });

// ---- Adding Intents and Responses ---- //
manager.addDocument('en', 'hello', 'greeting');
manager.addDocument('hi', 'नमस्ते', 'greeting');
manager.addDocument('en', 'good morning', 'morning_greeting');
manager.addDocument('hi', 'सुप्रभात', 'morning_greeting');
manager.addDocument('en', 'connect to agent', 'handover_request');
manager.addDocument('en', 'disconnect from the chat', 'disconnect_request');

// Add responses
manager.addAnswer('en', 'greeting', 'Hello! How can I assist you today?');
manager.addAnswer('hi', 'greeting', 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?');
manager.addAnswer('en', 'morning_greeting', 'Good morning! Wishing you a productive day.');
manager.addAnswer('hi', 'morning_greeting', 'सुप्रभात! आपकी सुबह शुभ हो।');
manager.addAnswer('en', 'handover_request', "Connecting you to a human agent...");
manager.addAnswer('en', 'disconnect_request', "You are now disconnected from the agent. How can I assist you further?");

// Train and save the model
(async () => {
  await manager.train();
  manager.save();
  console.log("NLP model trained and saved successfully.");
})();

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/agent', (req, res) => res.sendFile(__dirname + '/agent.html'));

let chatHistory = [];
let agents = {};
let handoverStatus = {};
let userContext = {}; 
let userAnalytics = [];

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected to the chat');
  handoverStatus[socket.id] = false;
  userContext[socket.id] = {}; 

  userAnalytics.push({
    socketId: socket.id,
    event: 'connected',
    timestamp: new Date().toISOString(),
  });

  socket.on('register agent', () => {
    agents[socket.id] = socket;
    console.log('Agent registered:', socket.id);
  });

  socket.on('chat message', async (msg) => {
    console.log("User message received:", msg);

    userAnalytics.push({
      socketId: socket.id,
      message: msg,
      timestamp: new Date().toISOString(),
      handover: handoverStatus[socket.id] ? 'agent' : 'bot',
    });

    if (handoverStatus[socket.id]) {
      const agent = Object.values(agents)[0];
      if (agent) {
        agent.emit('chat message', { sender: 'User', text: msg });
        console.log("Message forwarded to agent.");
      } else {
        console.log("No agent available to forward the message.");
      }
      return;
    }

    const response = await manager.process(msg);

    if (response.intent === 'handover_request') {
      const agent = Object.values(agents)[0];
      if (agent) {
        handoverStatus[socket.id] = true;
        agent.emit('handover', { userSocketId: socket.id, message: msg });
        socket.emit('chat message', { sender: 'Bot', text: "Connecting you to a human agent..." });
      } else {
        socket.emit('chat message', { sender: 'Bot', text: "No agents are currently available. Please wait." });
      }
      return;
    }

    if (response.intent === 'disconnect_request') {
      handoverStatus[socket.id] = false;
      socket.emit('chat message', { sender: 'Bot', text: response.answer });

      const agent = Object.values(agents)[0];
      if (agent) {
        agent.emit('chat message', { sender: 'System', text: "The user has disconnected from the chat." });
      }
      console.log("Chat disconnected, bot resumes communication.");
      return;
    }

    userContext[socket.id].lastMessage = msg;

    const userMessage = { sender: 'User', text: msg };
    const botMessage = { sender: 'Bot', text: response.answer || "I'm here to help!" };
    chatHistory.push(userMessage, botMessage);

    socket.emit('chat message', userMessage);
    socket.emit('chat message', botMessage);

    fs.writeFile('chatHistory.json', JSON.stringify(chatHistory, null, 2), (err) => {
      if (err) console.error("Error saving chat history:", err);
    });
  });

  socket.on('agent message', ({ userSocketId, message }) => {
    const agentMessage = { sender: 'Agent', text: message };
    chatHistory.push(agentMessage);

    io.to(userSocketId).emit('chat message', agentMessage);

    fs.writeFile('chatHistory.json', JSON.stringify(chatHistory, null, 2), (err) => {
      if (err) console.error("Error saving chat history:", err);
    });
  });

  socket.on('end chat', () => {
    if (handoverStatus[socket.id]) {
      handoverStatus[socket.id] = false;
    }
    socket.disconnect();
    console.log('Chat ended by user or agent');

    userAnalytics.push({
      socketId: socket.id,
      event: 'disconnected',
      timestamp: new Date().toISOString(),
    });

    delete userContext[socket.id];
  });

  socket.on('disconnect', () => {
    delete agents[socket.id];
    delete handoverStatus[socket.id];
    console.log('User or agent disconnected');

    userAnalytics.push({
      socketId: socket.id,
      event: 'disconnected',
      timestamp: new Date().toISOString(),
    });

    delete userContext[socket.id];
  });
});

setInterval(() => {
  fs.writeFile('userAnalytics.json', JSON.stringify(userAnalytics, null, 2), (err) => {
    if (err) console.error("Error saving user analytics:", err);
    else console.log("User analytics saved successfully.");
  });
}, 60000);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
