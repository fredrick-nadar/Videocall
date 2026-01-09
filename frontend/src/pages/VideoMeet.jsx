import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const server_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        {
            "urls": "turn:openrelay.metered.ca:80",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        },
        {
            "urls": "turn:openrelay.metered.ca:443",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        },
        {
            "urls": "turn:openrelay.metered.ca:443?transport=tcp",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef([])
    let [videos, setVideos] = useState([])

    // Waiting room states
    let [isHost, setIsHost] = useState(false);
    let [isWaiting, setIsWaiting] = useState(false);
    let [isApproved, setIsApproved] = useState(false);
    let [isRejected, setIsRejected] = useState(false);
    let [joinRequests, setJoinRequests] = useState([]);

    useEffect(() => {
        getPermissions();
    }, [])

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                videoPermission.getTracks().forEach(track => track.stop());
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                audioPermission.getTracks().forEach(track => track.stop());
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    let getMedia = () => {
        setVideo(true);
        setAudio(true);
        connectToSocketServer();
    }

    // Get user media with actual start
    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ 
                video: video && videoAvailable, 
                audio: audio && audioAvailable 
            })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject?.getTracks() || [];
                tracks.forEach(track => track.stop());
            } catch (e) { 
                console.log(e);
            }
            
            // Set black silence when both are off
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            
            updatePeerConnections();
        }
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream?.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        updatePeerConnections();

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject?.getTracks() || [];
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            updatePeerConnections();
        })
    }

    let updatePeerConnections = () => {
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            // Replace tracks instead of adding new stream
            const senders = connections[id].getSenders();
            const videoTrack = window.localStream.getVideoTracks()[0];
            const audioTrack = window.localStream.getAudioTracks()[0];

            senders.forEach(sender => {
                if (sender.track?.kind === 'video' && videoTrack) {
                    sender.replaceTrack(videoTrack);
                } else if (sender.track?.kind === 'audio' && audioTrack) {
                    sender.replaceTrack(audioTrack);
                }
            });
        }
    }

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e))
            }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream?.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        updatePeerConnections();

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoref.current.srcObject?.getTracks() || [];
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e) }

            getUserMedia();
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            const storedUsername = localStorage.getItem("username") || "Anonymous";
            socketRef.current.emit('join-call', window.location.href, storedUsername)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('you-are-host', () => {
                setIsHost(true);
                setIsApproved(true);
            });

            socketRef.current.on('waiting-for-approval', () => {
                setIsWaiting(true);
            });

            socketRef.current.on('approved', () => {
                setIsWaiting(false);
                setIsApproved(true);
            });

            socketRef.current.on('rejected', () => {
                setIsWaiting(false);
                setIsRejected(true);
            });

            socketRef.current.on('join-request', (participant) => {
                setJoinRequests(prev => [...prev, participant]);
            });

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    // Re-acquire media when video/audio states change
    useEffect(() => {
        if (!askForUsername && socketRef.current) {
            getUserMedia();
        }
    }, [video, audio]);

    let approveParticipant = (participantSocketId) => {
        socketRef.current.emit('approve-participant', window.location.href, participantSocketId);
        setJoinRequests(prev => prev.filter(p => p.socketId !== participantSocketId));
    }

    let rejectParticipant = (participantSocketId) => {
        socketRef.current.emit('reject-participant', window.location.href, participantSocketId);
        setJoinRequests(prev => prev.filter(p => p.socketId !== participantSocketId));
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject?.getTracks() || [];
            tracks.forEach(track => track.stop());
        } catch (e) { }
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }

    let closeChat = () => {
        setModal(false);
    }

    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        if (message.trim().length === 0) {
            return;
        }
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    return (
        <div>
            {askForUsername === true ?
                <Box className={styles.lobbyContainer}>
                    <Box className={styles.lobbyContent}>
                        <Card className={styles.lobbyCard} elevation={8}>
                            <CardContent sx={{ padding: '40px' }}>
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <VideocamIcon sx={{ fontSize: 60, color: '#000', mb: 2 }} />
                                    <Typography variant="h4" component="h1" sx={{ 
                                        fontWeight: 700, 
                                        mb: 1,
                                        color: '#000'
                                    }}>
                                        Ready to join?
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Set up your audio and video before joining the meeting
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

                                <Box sx={{ mb: 3 }}>
                                    <TextField 
                                        fullWidth
                                        id="username-input" 
                                        label="Your Name" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && username.trim() && connect()}
                                        variant="outlined"
                                        placeholder="Enter your name"
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                        sx={{ 
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#000' },
                                                '&:hover fieldset': { borderColor: '#000' },
                                                '&.Mui-focused fieldset': { borderColor: '#000' }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
                                        }}
                                    />
                                    
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        Meeting Code: <strong>{window.location.pathname.substring(1)}</strong>
                                    </Typography>
                                </Box>

                                <Box className={styles.videoPreviewContainer}>
                                    <video 
                                        ref={localVideoref} 
                                        autoPlay 
                                        muted 
                                        className={styles.videoPreview}
                                    />
                                    {!videoAvailable && !audioAvailable && (
                                        <Box className={styles.permissionWarning}>
                                            <Typography variant="body2" color="error">
                                                ⚠️ Camera and microphone permissions are required
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Button 
                                    fullWidth
                                    variant="contained" 
                                    size="large"
                                    onClick={connect}
                                    disabled={!username.trim()}
                                    sx={{ 
                                        mt: 3,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        textTransform: 'none',
                                        bgcolor: '#000',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                                        '&:hover': {
                                            bgcolor: '#333',
                                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
                                        },
                                        '&:disabled': {
                                            background: '#ccc'
                                        }
                                    }}
                                >
                                    Join Meeting
                                </Button>

                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Button 
                                        startIcon={<SettingsIcon />}
                                        size="small"
                                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                                    >
                                        Audio & Video Settings
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box> :

                isWaiting ? (
                    <Box className={styles.lobbyContainer}>
                        <Box className={styles.lobbyContent}>
                            <Card className={styles.lobbyCard} elevation={8}>
                                <CardContent sx={{ padding: '40px', textAlign: 'center' }}>
                                    <Box sx={{ mb: 3 }}>
                                        <MeetingRoomIcon sx={{ fontSize: 80, color: '#666', mb: 2 }} />
                                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#000' }}>
                                            Waiting for Host Approval
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Please wait while the host reviews your request to join the meeting...
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mt: 4 }}>
                                        <div className={styles.loader}></div>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                ) : 
                
                isRejected ? (
                    <Box className={styles.lobbyContainer}>
                        <Box className={styles.lobbyContent}>
                            <Card className={styles.lobbyCard} elevation={8}>
                                <CardContent sx={{ padding: '40px', textAlign: 'center' }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#d32f2f' }}>
                                            Access Denied
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            The host has declined your request to join this meeting.
                                        </Typography>
                                    </Box>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => window.location.href = "/home"}
                                        sx={{ 
                                            mt: 2,
                                            bgcolor: '#000',
                                            '&:hover': { bgcolor: '#333' }
                                        }}
                                    >
                                        Return to Home
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                ) :

                <div className={`${styles.meetVideoContainer} ${videos.length === 0 ? styles.soloMode : ''}`}>
                    
                    {isHost && joinRequests.length > 0 && (
                        <Box sx={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 1000,
                            maxWidth: '320px',
                            animation: 'slideInRight 0.3s ease-out',
                            '@keyframes slideInRight': {
                                from: { transform: 'translateX(100%)', opacity: 0 },
                                to: { transform: 'translateX(0)', opacity: 1 }
                            }
                        }}>
                            <Card sx={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.98) 100%)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.8)',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                                    color: 'white',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <PersonIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                                            Waiting Room
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>
                                            {joinRequests.length} {joinRequests.length === 1 ? 'person' : 'people'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ padding: '12px' }}>
                                    {joinRequests.map((participant, index) => (
                                        <Box key={index} sx={{ 
                                            mb: 1.5,
                                            p: '12px 14px',
                                            background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                transform: 'translateY(-1px)'
                                            },
                                            '&:last-child': { mb: 0 }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    mr: 1.5
                                                }}>
                                                    {participant.username.charAt(0).toUpperCase()}
                                                </Box>
                                                <Typography variant="body1" sx={{ 
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    color: '#1a1a1a',
                                                    flex: 1
                                                }}>
                                                    {participant.username}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button 
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => approveParticipant(participant.socketId)}
                                                    sx={{ 
                                                        bgcolor: '#000',
                                                        color: 'white',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        py: 0.75,
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                        '&:hover': { 
                                                            bgcolor: '#1a1a1a',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                                            transform: 'translateY(-1px)'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    Admit
                                                </Button>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => rejectParticipant(participant.socketId)}
                                                    sx={{ 
                                                        bgcolor: 'rgba(0,0,0,0.04)',
                                                        borderRadius: '8px',
                                                        width: 36,
                                                        height: 36,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': { 
                                                            bgcolor: '#ffebee',
                                                            color: '#d32f2f',
                                                            transform: 'rotate(90deg)'
                                                        }
                                                    }}
                                                >
                                                    <CloseIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>
                        </Box>
                    )}

                    <div className={`${styles.chatRoom} ${showModal ? styles.active : ''}`}>
                        <div className={styles.chatContainer}>
                            <div className={styles.chatHeader}>
                                <h1>Chat</h1>
                                <IconButton onClick={() => setModal(false)} className={styles.closeChatBtn}>
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            <div className={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}
                            </div>

                            <div className={styles.chattingArea}>
                                <TextField 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    id="outlined-basic" 
                                    label="Enter Your chat" 
                                    variant="outlined" 
                                />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div>

                    {showModal && <div className={`${styles.chatBackdrop} ${styles.active}`} onClick={() => setModal(false)}></div>}

                    <div className={styles.buttonContainers}>
                        <div className={styles.dockButton}>
                            <IconButton onClick={handleVideo} className={styles.controlBtn}>
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </div>
                        <div className={styles.dockButton}>
                            <IconButton onClick={handleEndCall} className={styles.controlBtn} sx={{ bgcolor: '#d32f2f !important' }}>
                                <CallEndIcon />
                            </IconButton>
                        </div>
                        <div className={styles.dockButton}>
                            <IconButton onClick={handleAudio} className={styles.controlBtn}>
                                {audio === true ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </div>

                        {screenAvailable === true && (
                            <div className={styles.dockButton}>
                                <IconButton onClick={handleScreen} className={styles.controlBtn}>
                                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                </IconButton>
                            </div>
                        )}

                        <div className={styles.dockButton}>
                            <Badge badgeContent={newMessages} max={999} color='error'>
                                <IconButton onClick={() => setModal(!showModal)} className={styles.controlBtn}>
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </div>
                    </div>

                    <video className={`${styles.meetUserVideo} ${videos.length === 0 ? styles.solo : ''}`} ref={localVideoref} autoPlay muted playsInline></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted={false}
                                >
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    )
}