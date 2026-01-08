# VideoCall Server

Production-ready video calling server with WebRTC, Socket.io, and MongoDB support.

## Installation

```bash
npm install videocall-server
```

## Quick Start

### Basic Setup (No Database)

**server.js:**
```javascript
const videocallServer = require('videocall-server');

videocallServer.start({
  port: 8000,
  corsOrigin: 'http://localhost:3000'
});
```

Run: `node server.js`

### With MongoDB

**server.js:**
```javascript
require('dotenv').config();
const videocallServer = require('videocall-server');

videocallServer.start({
  port: process.env.PORT || 8000,
  mongoUrl: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || '*'
});
```

**.env:**
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videocall
CORS_ORIGIN=http://localhost:3000
```

Run: `node server.js`

## Features

✅ WebRTC peer-to-peer connections  
✅ Socket.io real-time signaling  
✅ Waiting room with host approval  
✅ Chat messaging  
✅ MongoDB meeting history (optional)  
✅ Ready for production deployment  

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | 8000 | Server port |
| `mongoUrl` | string | undefined | MongoDB connection URL |
| `corsOrigin` | string | '*' | CORS allowed origin |

## API Endpoints

- `GET /health` - Health check
- `GET /api/meetings` - Get recent meetings (requires MongoDB)

## Frontend Integration

Use with `videocall-react`:

```bash
npm install videocall-react
```

```jsx
import { VideoCall } from 'videocall-react';

<VideoCall serverUrl="http://localhost:8000" />
```

## License

MIT
