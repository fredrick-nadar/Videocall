const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Track connections and rooms
let connections = {};
let messages = {};
let timeOnline = {};
let hosts = {}; // Track the host (first person) for each room
let waitingRoom = {}; // Track people waiting for approval

/**
 * Start VideoCall Server
 * 
 * @param {Object} config - Configuration object
 * @param {number} config.port - Server port (default: 8000)
 * @param {string} config.mongoUrl - MongoDB connection URL (optional)
 * @param {string} config.corsOrigin - CORS allowed origin (default: *)
 */
function start(config = {}) {
  const {
    port = process.env.PORT || 8000,
    mongoUrl = process.env.MONGODB_URI,
    corsOrigin = process.env.CORS_ORIGIN || '*'
  } = config;

  const app = express();
  const server = http.createServer(app);
  
  // CORS Configuration
  app.use(cors({
    origin: corsOrigin,
    credentials: true
  }));

  app.use(express.json());

  // Socket.IO Setup
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
  });

  // MongoDB Connection (optional)
  if (mongoUrl) {
    mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
    })
      .then(() => {
        console.log('✓ MongoDB connected');
        
        // Define schemas
        const userSchema = new mongoose.Schema({
          username: String,
          email: String,
          createdAt: { type: Date, default: Date.now }
        });

        const meetingSchema = new mongoose.Schema({
          meetingId: String,
          host: String,
          participants: [String],
          startTime: Date,
          endTime: Date,
          duration: Number
        });

        global.User = mongoose.model('User', userSchema);
        global.Meeting = mongoose.model('Meeting', meetingSchema);
      })
      .catch(err => console.log('MongoDB connection error:', err));
  }

  // Socket.IO Event Handlers
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-call', async (path, username) => {
      if (connections[path] === undefined) {
        connections[path] = [];
        hosts[path] = socket.id; // First person is the host
        waitingRoom[path] = [];
      }

      // Check if this user is the host
      if (hosts[path] === socket.id) {
        // Host joins immediately
        connections[path].push(socket.id);
        timeOnline[socket.id] = new Date();

        for (let a = 0; a < connections[path].length; a++) {
          io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
        }

        // Send host status to the host
        io.to(socket.id).emit("you-are-host");
        io.to(socket.id).emit("approved");

        // Send chat history
        if (messages[path] !== undefined) {
          for (let a = 0; a < messages[path].length; ++a) {
            io.to(socket.id).emit("chat-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
          }
        }

        // Save meeting to DB if MongoDB is connected
        if (mongoUrl && global.Meeting) {
          try {
            await new global.Meeting({
              meetingId: path,
              host: username,
              participants: [username],
              startTime: new Date()
            }).save();
          } catch (err) {
            console.log('Error saving meeting:', err);
          }
        }
      } else {
        // Not the host - add to waiting room and notify host
        waitingRoom[path].push({
          socketId: socket.id,
          username: username || 'Anonymous User'
        });

        io.to(socket.id).emit("waiting-for-approval");
        io.to(hosts[path]).emit("join-request", {
          socketId: socket.id,
          username: username || 'Anonymous User'
        });

        console.log(`User ${username} waiting for approval in room ${path}`);
      }
    });

    // Host approves a participant
    socket.on("approve-participant", (path, participantSocketId) => {
      if (hosts[path] === socket.id) {
        // Remove from waiting room
        waitingRoom[path] = waitingRoom[path].filter(p => p.socketId !== participantSocketId);

        // Add to connections
        connections[path].push(participantSocketId);
        timeOnline[participantSocketId] = new Date();

        // Notify everyone about the new user
        for (let a = 0; a < connections[path].length; a++) {
          io.to(connections[path][a]).emit("user-joined", participantSocketId, connections[path]);
        }

        // Send approval to the participant
        io.to(participantSocketId).emit("approved");

        // Send chat history
        if (messages[path] !== undefined) {
          for (let a = 0; a < messages[path].length; ++a) {
            io.to(participantSocketId).emit("chat-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
          }
        }

        console.log(`Host approved participant ${participantSocketId}`);
      }
    });

    // Host rejects a participant
    socket.on("reject-participant", (path, participantSocketId) => {
      if (hosts[path] === socket.id) {
        // Remove from waiting room
        waitingRoom[path] = waitingRoom[path].filter(p => p.socketId !== participantSocketId);

        // Notify participant of rejection
        io.to(participantSocketId).emit("rejected");

        console.log(`Host rejected participant ${participantSocketId}`);
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, foundRoom] = Object.entries(connections).reduce(([foundRoom, isFound], [roomKey, roomValue]) => {
        if (!isFound && roomValue.includes(socket.id)) {
          return [roomKey, true];
        }
        return [foundRoom, isFound];
      }, ['', false]);

      if (foundRoom === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({ 'sender': sender, 'data': data, "socket-id-sender": socket.id });
        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach(element => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", async () => {
      var diffTime = Math.abs(new Date() - timeOnline[socket.id]);

      var roomKey;
      for (const [key, value] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
        for (let a = 0; a < value.length; ++a) {
          if (value[a] === socket.id) {
            roomKey = key;

            for (let b = 0; b < connections[key].length; ++b) {
              io.to(connections[key][b]).emit("user-left", socket.id, diffTime);
            }

            var index = connections[key].indexOf(socket.id);
            connections[roomKey].splice(index, 1);

            if (connections[key].length === 0) {
              // Update meeting end time in DB
              if (mongoUrl && global.Meeting) {
                try {
                  await global.Meeting.findOneAndUpdate(
                    { meetingId: key },
                    {
                      endTime: new Date(),
                      duration: diffTime
                    }
                  );
                } catch (err) {
                  console.log('Error updating meeting:', err);
                }
              }

              delete connections[key];
              delete messages[key];
              delete hosts[key];
              delete waitingRoom[key];
            }
          }
        }
      }
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: Object.keys(connections).length,
      dbConnected: mongoose.connection.readyState === 1
    });
  });

  // Get active meetings (if MongoDB connected)
  app.get('/api/meetings', async (req, res) => {
    if (!mongoUrl || !global.Meeting) {
      return res.json({ error: 'Database not configured' });
    }

    try {
      const meetings = await global.Meeting.find().sort({ startTime: -1 }).limit(10);
      res.json(meetings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  server.listen(port);

  return { app, server, io };
}

module.exports = { start };
