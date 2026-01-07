import React, { useEffect, useState } from 'react'
import {connect, io} from "socket.io-client";
const server_url = "http://localhost:8000"
var connections = {}
const peerConnectionConfig = {
  'iceServers': [
    { 'urls': 'stun:stun.l.google.com:19302' },
    { 'urls': 'stun:stun1.l.google.com:19302' },
    { 'urls': 'stun:stun2.l.google.com:19302' },
    { 'urls': 'stun:stun3.l.google.com:19302' },
    { 'urls': 'stun:stun4.l.google.com:19302' }
  ]
}

export default function VideoMeet() {

    var SocketRef = React.useRef();
    let SocketIdRef = React.useRef();
    let localVideoRef = React.useRef();
    const[videoaAvailable,setVideoAvailable] = useState(true);
    const[audioAvailable,setAudioAvailable] = useState(true);
    const[video,setVideo] = useState(null);
    const[audio,setAudio] = useState(null);
    const[showModal,setShowModal] = useState(false);
    const[screenAvailable,setScreenAvailable] = useState(false);
    const[message,setMessage] = useState("");
    const[messages,setMessages] = useState([]);
    const[newMessage,setNewMessage] = useState("");
    const[askForUsername,setAskForUsername] = useState(true);
    const[username,setUsername] = useState("");
    const[videos,setVideos] = useState([]);

    const videoRef = React.useRef([]);
    
    // if(isChrome() === false )

    const getPermissions = async () => {
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }

            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }   

            if(videoPermission || audioPermission){
                const stream = await navigator.mediaDevices.getUserMedia({ video: videoPermission ? true : false, audio: audioPermission ? true : false });

                if(stream){
                    window.localStream = stream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = stream;
                    }
                }
            }
        }catch(err){
            console.log("Permission error:", err);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if(video !== undefined && audio !== undefined){
            getMedia();
        }
    }, [audio, video]);

    useEffect(() => {
        if(localVideoRef.current && window.localStream && !askForUsername){
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    let getUserMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach((track) => {
                track.stop();
            });
        }catch(e){console.log(e)}
            window.localStream = stream;
            localVideoRef.current.srcObject = stream;

            for(let id in connections){
                if(id === SocketIdRef.current) continue;
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });

                connections[id].createOffer()
                .then((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        SocketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].localDescription}));
                    })
                    .catch(e => console.log(e));
            })
        }
        stream.getTracks().forEach((track) => {
            track.onended = () => {
                setAudio(false);
                setVideo(false);
            }

                try{
                    let tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                }catch(e){
                    console.log(e)
                }

                let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
                        window.localStream = blackSilence();
                        localVideoRef.current.srcObject =  window.localStream;

                for(let id in connections){
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        SocketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].localDescription}));
                    })
                    .catch(e => console.log(e));
                })
            }
        });
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false} );
    }

    let blackScreen = () => {
        let canvas = Object.assign(document.createElement('canvas'), {width: 640, height: 480});
        canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false} );
    }

    let getUserMedia = () => {
        if(video && videoaAvailable === true || audio && audioAvailable === true){ 
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio }) 
            .then(getUserMediaSuccess)
            .then((stream) => {})
            .catch((err) => {
                console.log("Get user media error:", err)});
            }else {
                try{
                    let tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                }catch(e){
                    console.log(e)
            }   
        }    
    }

    let gotMessageFromServer = (fromId,message) => {
        var signal = JSON.parse(message);

        if(fromId !== SocketIdRef.current){
            // Check if connection exists, if not skip (it should have been created in user-joined)
            if(!connections[fromId]){
                console.log("Received signal from unknown peer:", fromId);
                return;
            }

            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(()=>{
                    if(signal.sdp.type === "offer"){
                        connections[fromId].createAnswer()
                        .then((description)=>{
                            connections[fromId].setLocalDescription(description)
                            .then(()=>{
                                SocketRef.current.emit("signal",fromId,JSON.stringify({'sdp': connections[fromId].localDescription}));
                            })
                            .catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.log(e));
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, {sender: sender, data: data}]);
        setMessage("");
    }

    let connectToSocketServer = () => {
        SocketRef.current =  io.connect(server_url, {secure:false})
        SocketRef.current.on('signal',gotMessageFromServer);
        SocketRef.current.on('connect',()=>{

            SocketRef.current.emit("join-call",window.location.href);
            SocketIdRef.current = SocketRef.current.id;
            SocketRef.current.on("chat-message", addMessage)
            
            SocketRef.current.on("user-left",(id)=>{
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            SocketRef.current.on("user-joined",(id,clients)=>{
                // clients array contains all users in the room including yourself
                clients.forEach((socketListId) => {
                    // Don't create connection for yourself or if connection already exists
                    if(socketListId === SocketIdRef.current || connections[socketListId]) return;
                    
                    connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);

                    connections[socketListId].onicecandidate = (event)=>{
                        if(event.candidate != null){
                            SocketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}));
                        }
                    }

                    connections[socketListId].ontrack = (event)=>{
                        console.log('Received remote track from', socketListId, 'Track kind:', event.track.kind);
                        
                        setVideos(videos => {
                            // Check if video already exists - ontrack fires once per track (audio + video)
                            const videoExists = videos.find((v) => v.socketId === socketListId);
                            
                            if(videoExists){
                                console.log('Video already exists for', socketListId, '- skipping duplicate');
                                // Video already exists, don't add again (just return unchanged array)
                                return videos;
                            } else {
                                console.log('Adding new video for', socketListId);
                                // Add new video only on first track received
                                const newVideo = {socketId: socketListId, stream: event.streams[0], autoPlay: true, playinline: true};
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                console.log('Updated videos array:', updatedVideos);
                                return updatedVideos;
                            }
                        });
                    };

                    // Add local stream to the connection
                    if(window.localStream !== undefined && window.localStream !== null){
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }else{
                        let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
                        window.localStream = blackSilence();
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }

                    // Only create offer if this is the new user joining (id parameter)
                    // This prevents duplicate offers when you're the one joining
                    if(socketListId === id){
                        connections[socketListId].createOffer()
                        .then((description)=>{
                            connections[socketListId].setLocalDescription(description)
                            .then(()=>{
                                SocketRef.current.emit("signal", socketListId, JSON.stringify({'sdp': connections[socketListId].localDescription}));
                            })
                            .catch(e => console.log(e));
                        })
                        .catch(e => console.log(e));
                    }
                });
            });


        });
    }

    let getMedia = () => {
        setVideo(videoaAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

  return (
    <div>
        {askForUsername === true ? (
            <div className="username-modal">
                <div className="lobby-video-container">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className="local-video"
                        style={{ width: '400px', height: '300px', backgroundColor: '#000', marginBottom: '20px' }}
                    />
                </div>
                <h2>Enter your username</h2>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                /> 
                <button onClick={() => {
                    if(username.trim() !== ""){
                        setAskForUsername(false);
                        getMedia();
                    }
                }}>Join</button>
            </div>
        ) : <>
        <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            style={{ width: '400px', height: '300px', backgroundColor: '#000' }}
        ></video>

        {videos.map((video) =>(
        <div key ={video.socketId}>
            <h2>{video.socketId}</h2>
            <video data-socket={video.socketId} ref={ref => {
                if (ref && video.stream) {
                    ref.srcObject = video.stream;
                }
            }}
            autoPlay 
            playsInline
            style={{ width: '400px', height: '300px', backgroundColor: '#000' }}
            >


            </video>
        </div> 
        ))}
        
        </>}
    </div>
  )
}

