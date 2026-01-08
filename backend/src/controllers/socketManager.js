import { Server } from "socket.io";

let connections={}
let messages={}
let timeOnline={}
let hosts={} // Track the host (first person) for each room
let waitingRoom={} // Track people waiting for approval

const connectToSocket = (server) => {
  const io = new Server(server, { 
    cors:{
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
  });

  io.on("connection", (socket)=>{

    console.log("Something connected");

     socket.on("join-call",(path, username)=>{
      if(connections[path] === undefined){
        connections[path] = []
        hosts[path] = socket.id // First person is the host
        waitingRoom[path] = []
      }

      // Check if this user is the host
      if(hosts[path] === socket.id){
        // Host joins immediately
        connections[path].push(socket.id)
        timeOnline[socket.id] = new Date();

        for(let a = 0; a < connections[path].length; a++){
          io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
        }

        // Send host status to the host
        io.to(socket.id).emit("you-are-host");

        if(messages[path] !== undefined){
          for(let a=0;a<messages[path].length;++a){
            io.to(socket.id).emit("chat-message",messages[path][a]['data'],messages[path][a]['sender'],messages[path][a]['socket-id-sender'])
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
     })

     // Host approves a participant
     socket.on("approve-participant", (path, participantSocketId) => {
       if(hosts[path] === socket.id) {
         // Remove from waiting room
         waitingRoom[path] = waitingRoom[path].filter(p => p.socketId !== participantSocketId);
         
         // Add to connections
         connections[path].push(participantSocketId);
         timeOnline[participantSocketId] = new Date();

         // Notify everyone about the new user
         for(let a = 0; a < connections[path].length; a++){
           io.to(connections[path][a]).emit("user-joined", participantSocketId, connections[path]);
         }

         // Send approval to the participant
         io.to(participantSocketId).emit("approved");

         // Send chat history
         if(messages[path] !== undefined){
           for(let a=0;a<messages[path].length;++a){
             io.to(participantSocketId).emit("chat-message",messages[path][a]['data'],messages[path][a]['sender'],messages[path][a]['socket-id-sender'])
           }
         }
         
         console.log(`Host approved participant ${participantSocketId}`);
       }
     })

     // Host rejects a participant
     socket.on("reject-participant", (path, participantSocketId) => {
       if(hosts[path] === socket.id) {
         // Remove from waiting room
         waitingRoom[path] = waitingRoom[path].filter(p => p.socketId !== participantSocketId);
         
         // Notify participant of rejection
         io.to(participantSocketId).emit("rejected");
         
         console.log(`Host rejected participant ${participantSocketId}`);
       }
     })

     socket.on("signal",(toId,message)=>{
      io.to(toId).emit("signal",socket.id,message);
     })

     socket.on("chat-message",(data,sender)=>{

      const[matchingRoom,foundRoom] = Object.entries(connections).reduce(([foundRoom,isFound],[roomKey,roomValue])=>{
        if(!isFound && roomValue.includes(socket.id)){
          return [roomKey, true];
        }
        return [foundRoom, isFound];
      },['',false]);
      if(foundRoom === true){
        if(messages[matchingRoom]=== undefined){
          messages[matchingRoom] = []
        }
        messages[matchingRoom].push({'sender':sender,'data':data,"socket-id-sender":socket.id})
        console.log("message", matchingRoom, ":", sender,data)

          connections[matchingRoom].forEach(element => {
            io.to(element).emit("chat-message", data, sender, socket.id);
            
          });
      }

     })
     socket.on("disconnect",()=>{
      var diffTime = Math.abs(new Date() - timeOnline[socket.id]);

      var roomKey
      for(const[key,value] of JSON.parse(JSON.stringify(Object.entries(connections)))){
        for(let a=0;a<value.length;++a){
          if(value[a] === socket.id){
            roomKey = key;
            
            for(let b=0;b<connections[key].length;++b){
              io.to(connections[key][b]).emit("user-left", socket.id, diffTime);
            }

            var index = connections[key].indexOf(socket.id);
            connections[roomKey].splice(index, 1);

            if(connections[key].length === 0){
              delete connections[key];
              delete messages[key];
            }
          }
        }
      }

     })
  })

  return io;
}

export default connectToSocket;