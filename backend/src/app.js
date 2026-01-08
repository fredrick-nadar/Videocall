import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";
import Meeting from "./models/meeting.model.js";

dotenv.config();
const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({extended: true, limit: "40kb"}));   

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

app.use("/api/v1/user", userRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });
    console.log("✓ Connected to MongoDB successfully");
    console.log("Database:", mongoose.connection.name);
    
    // Drop old meeting_id index if it exists
    try {
      await Meeting.collection.dropIndex('meeting_id_1');
      console.log("✓ Dropped old meeting_id index");
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log("✓ No old index to drop (already clean)");
      } else {
        console.log("Note: Could not drop old index:", error.message);
      }
    }
    
    // Start server only after DB connection is established
    server.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("✗ Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Mongoose connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

ConnectDB();


