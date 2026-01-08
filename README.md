# VideoCall - WebRTC Video Calling Application

A full-stack video calling application that enables real-time peer-to-peer video communication through the browser. Built with React, Node.js, and WebRTC technology, this application provides a complete solution for hosting video meetings with multiple participants.

## ✨ Features

### 🎥 Core Video Calling
- **Peer-to-Peer Video** - Direct WebRTC connections for high-quality video streaming
- **Multi-Participant Support** - Host meetings with multiple users
- **Audio/Video Controls** - Toggle camera and microphone on/off during calls
- **Picture-in-Picture** - View multiple participants simultaneously

### 🎨 User Interface
- **Beautiful Glass Morphism Design** - Modern, elegant Material-UI interface
- **Responsive Layout** - Works seamlessly on desktop and mobile devices
- **Meeting Lobby** - Enter meeting codes and set display names before joining
- **Waiting Room** - Participants wait for host approval before joining

### 🚀 Advanced Features
- **Screen Sharing** - Share your entire screen or specific windows
- **Real-time Chat** - Send text messages to all participants during the call
- **Host Controls** - Approve or reject participants trying to join
- **Meeting History** - Optional MongoDB integration to track past meetings
- **Participant Management** - See who's in the call and manage permissions

### 🔒 Security & Privacy
- **Encrypted Connections** - WebRTC provides end-to-end encryption
- **Host Approval System** - Control who can join your meetings
- **No Third-Party Servers** - Peer-to-peer connections keep your data private

## 🚀 Getting Started

### Prerequisites

- **Node.js** 14 or higher
- **Modern Browser** (Chrome, Firefox, Safari, Edge)
- **MongoDB** (optional, for meeting history)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/videocall.git
cd videocall
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
Server runs on `http://localhost:8000`

2. **Start the Frontend Application**
```bash
cd frontend
npm start
```
Application opens at `http://localhost:3000`

### Testing Video Calls

1. **Open First Tab** - Navigate to `http://localhost:3000`
   - Enter a meeting code (e.g., "team-meeting")
   - Enter your name (e.g., "Alice")
   - Click "Join" - you become the host

2. **Open Second Tab/Window** - Open another browser tab/window at `http://localhost:3000`
   - Enter the **same** meeting code ("team-meeting")
   - Enter a different name (e.g., "Bob")
   - Click "Join" - wait for approval

3. **Approve Participant** - Back in the first tab (Alice)
   - See "Bob wants to join" notification
   - Click "✓ Approve"

4. **Start Calling!**
   - Both users now see each other's video
   - Use controls to toggle camera/mic
   - Share screens or send chat messages
   - End call when finished

## 🏗️ Project Structure

## 🏗️ Project Structure

```
videocall/
├── backend/                    # Node.js signaling server
│   ├── src/
│   │   ├── app.js             # Express server setup
│   │   ├── controllers/       # Socket.io handlers
│   │   │   ├── socketManager.js
│   │   │   └── user.controller.js
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── meeting.model.js
│   │   │   └── user.model.js
│   │   └── routes/            # API routes
│   │       └── user.routes.js
│   └── package.json
│
└── frontend/                   # React application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   └── ColorBends.jsx
    │   ├── contexts/          # React contexts
    │   │   └── AuthContext.jsx
    │   ├── pages/             # Main page components
    │   │   ├── Landing.jsx    # Landing page
    │   │   ├── Home.jsx       # Home dashboard
    │   │   ├── VideoMeet.jsx  # Main video call interface
    │   │   ├── History.jsx    # Meeting history
    │   │   └── AuthPage.jsx   # Authentication
    │   ├── utils/             # Helper functions
    │   │   └── withAuth.js
    │   └── App.js             # Main app component
    └── package.json
```

## 📚 Technology Stack

### Frontend
- **React 19** - UI framework
- **WebRTC API** - Browser video/audio capture and peer connections
- **Socket.io Client** - Real-time communication with signaling server
- **Material-UI (MUI)** - Component library and styling
- **React Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **Socket.io** - WebSocket server for real-time signaling
- **MongoDB** - Database for user data and meeting history (optional)
- **Mongoose** - MongoDB object modeling

## 🎯 How It Works

### WebRTC Architecture

1. **Signaling Server** - Backend Socket.io server coordinates connections
2. **Peer Discovery** - Users join meeting rooms and discover each other
3. **WebRTC Connection** - Direct peer-to-peer video/audio streams established
4. **Data Channels** - Chat messages sent through WebRTC data channels

### Connection Flow

```
User A                  Signaling Server                User B
  |                            |                           |
  |-------- Join Meeting ----->|                           |
  |                            |<------- Join Meeting -----|
  |                            |                           |
  |<----- Participant List ----|-----> Participant List -->|
  |                            |                           |
  |-------- WebRTC Offer ----->|                           |
  |                            |-----> WebRTC Offer ------>|
  |                            |                           |
  |                            |<----- WebRTC Answer ------|
  |<------ WebRTC Answer ------|                           |
  |                            |                           |
  |<========== Direct P2P Video/Audio Connection =========>|
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/videocall  # Optional
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_SERVER_URL=http://localhost:8000
```

## 🚢 Production Deployment

### Backend Deployment

1. **Build for production**
```bash
cd backend
npm install --production
```

2. **Deploy to hosting service** (Heroku, AWS, DigitalOcean, etc.)
   - Set environment variables
   - Ensure MongoDB connection (if using)
   - Configure CORS for your frontend domain

### Frontend Deployment

1. **Build production bundle**
```bash
cd frontend
npm run build
```

2. **Deploy `build/` folder** to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static hosting service

### Important Production Considerations

- **HTTPS Required** - WebRTC requires HTTPS for camera/microphone access
- **TURN Server** - Add TURN server for users behind strict NATs/firewalls
- **CORS Configuration** - Set specific allowed origins, not "*"
- **Environment Variables** - Use production URLs and secure credentials

## 💡 Use Cases

- 🏢 **Corporate Meetings** - Remote team collaboration and standup
- 📚 **Online Education** - Virtual classrooms and tutoring sessions
- 🏥 **Telehealth** - Remote medical consultations and therapy
- 👥 **Social Gatherings** - Virtual hangouts with friends and family
- 💼 **Customer Support** - Face-to-face customer assistance
- 🎓 **Interviews** - Remote job interviews and assessments

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes** and test thoroughly
4. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
5. **Push to the branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes with multiple users
- Update documentation for new features
- Ensure backward compatibility

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- **Check browser permissions** - Allow camera/microphone access
- **Use HTTPS** - Required in production for getUserMedia()
- **Check device availability** - Ensure camera/mic not used by other apps

### Connection Issues
- **Backend not running** - Start the backend server first
- **CORS errors** - Check CORS_ORIGIN matches frontend URL
- **Firewall blocking** - Check firewall and network settings
- **NAT/Firewall issues** - Consider adding TURN server

### Video Quality Issues
- **Network bandwidth** - Check internet connection speed
- **Multiple participants** - WebRTC quality adapts to network conditions
- **Browser compatibility** - Use latest Chrome, Firefox, Safari, or Edge

### Build Errors
- **Clear cache** - `rm -rf node_modules && npm install`
- **Check Node version** - Ensure Node.js 14+ installed
- **Dependency conflicts** - Check for peer dependency warnings

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 📦 NPM Packages

This application is also available as standalone npm packages for easy integration into your own projects:

- **[videocall-react](https://www.npmjs.com/package/videocall-react)** - React video calling component
- **[videocall-server](https://www.npmjs.com/package/videocall-server)** - WebRTC signaling server

Install with:
```bash
npm install videocall-react videocall-server
```

See the [videocall-react documentation](https://www.npmjs.com/package/videocall-react) for integration guide.

---

Built with ❤️ using React, Node.js, and WebRTC
