# VideoCall React

Production-ready React video calling component with WebRTC support.

## Installation

```bash
npm install videocall-react videocall-server
```

## Complete Setup Guide

### Step 1: Create Project Structure

```bash
mkdir my-videocall-app
cd my-videocall-app
npm init -y
npm install videocall-server
```

### Step 2: Create Backend Server

Create **server.js:**
```javascript
const videocallServer = require('videocall-server');

videocallServer.start({
  port: 5000,
  corsOrigin: '*'  // Allow all origins for development
});
```

### Step 3: Create React Frontend

```bash
npx create-react-app frontend
cd frontend
npm install videocall-react
```

### Step 4: Update React App

Edit **frontend/src/App.js:**
```jsx
import React from 'react';
import VideoCall from 'videocall-react';  // Default import
import './App.css';

function App() {
  return (
    <div className="App">
      <VideoCall 
        serverUrl="http://localhost:5000"
        username="User"
        onCallEnd={() => console.log('Call ended')}
      />
    </div>
  );
}

export default App;
```

### Step 5: Run the Application

**Terminal 1 - Start Backend:**
```bash
# From my-videocall-app directory
node server.js
```

**Terminal 2 - Start Frontend:**
```bash
# From my-videocall-app/frontend directory
npm start
```

### Step 6: Test Video Call on Two Tabs

1. **Open Tab 1:** http://localhost:3000
   - Enter a meeting code (e.g., "test-meeting")
   - Enter your name (e.g., "Alice")
   - Click "Join"
   - You'll be the **host** - wait in the lobby

2. **Open Tab 2:** http://localhost:3000 (new incognito/private window)
   - Enter the **same** meeting code ("test-meeting")
   - Enter a different name (e.g., "Bob")
   - Click "Join"
   - You'll see "Waiting for host approval"

3. **Back to Tab 1 (Alice - Host):**
   - You'll see "Bob wants to join"
   - Click "✓ Approve" button
   - Bob joins the call

4. **Now both users can:**
   - See each other's video
   - Toggle camera/microphone
   - Share screen
   - Send chat messages
   - End the call

## Props

| Prop       | Type     | Required  | Default        | Description                                      |
|------------|----------|---------  |-------------   |
| `serverUrl`| string   | ✅ Yes   | -              | Backend server URL (e.g., "http://localhost:5000") |
| `username` | string   | ❌ No    | ""             | Pre-fill username in lobby |
| `onCallEnd`| function | ❌ No    | -              | Callback when call ends |

## Features

✅ **Peer-to-peer video calling** with WebRTC  
✅ **Audio/Video controls** - Toggle camera and microphone  
✅ **Screen sharing** - Share your screen with participants  
✅ **Real-time chat** - Send messages during the call  
✅ **Waiting room** - Host approves participants before they join  
✅ **Lobby system** - Enter meeting code and username  
✅ **Beautiful UI** - Material-UI with glass morphism design  
✅ **Fully responsive** - Works on desktop and mobile  
✅ **Production-ready** - Built with best practices  

## Customization Example

Add your own meeting code logic:

```jsx
import React, { useState } from 'react';
import VideoCall from 'videocall-react';

function App() {
  const [meetingCode, setMeetingCode] = useState('');
  const [userName, setUserName] = useState('');
  const [inCall, setInCall] = useState(false);

  const joinMeeting = () => {
    if (meetingCode && userName) {
      setInCall(true);
    }
  };

  if (!inCall) {
    return (
      <div className="custom-lobby">
        <h1>Join Video Call</h1>
        <input 
          placeholder="Meeting Code" 
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
        />
        <input 
          placeholder="Your Name" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={joinMeeting}>Join</button>
      </div>
    );
  }

  return (
    <VideoCall 
      serverUrl="http://localhost:5000"
      username={userName}
      onCallEnd={() => setInCall(false)}
    />
  );
}

export default App;
```

## Troubleshooting

**Error: "Cannot connect to server"**
- Make sure backend server is running (`node server.js`)
- Check serverUrl prop matches your backend port

**Error: "Camera/Microphone not working"**
- Grant browser permissions for camera/microphone
- Use HTTPS in production (required for WebRTC)

**Error: "Module not found"**
- Run `npm install videocall-react` in frontend directory
- Check that React version is 17+ or 18+ or 19+

## Requirements

- **Node.js** 14+ 
- **React** 17.0.0 or 18.0.0 or 19.0.0
- **Backend** videocall-server package running

## Production Deployment

For production:
1. Use HTTPS (required for camera/microphone access)
2. Set specific CORS origin instead of '*'
3. Use environment variables for serverUrl
4. Consider adding MongoDB for meeting history

```javascript
// Production server.js
videocallServer.start({
  port: process.env.PORT || 5000,
  mongoUrl: process.env.MONGODB_URI,
  corsOrigin: 'https://yourdomain.com'
});
```

## License

MIT
