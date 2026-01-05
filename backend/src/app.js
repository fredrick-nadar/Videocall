import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";
const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({extended: true, limit: "40kb"}));   

app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

  server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 









const ConnectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://FREDDY:FrEdRiCk@cluster0.ste53hi.mongodb.net/")
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

ConnectDB();


