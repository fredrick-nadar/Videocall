import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Card, CardContent } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { AuthContext } from '../contexts/AuthContext';
import ColorBends from '../components/ColorBends';

function Home() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);
    
    let handleJoinVideoCall = async () => {
        if (meetingCode.trim()) {
            await addToUserHistory(meetingCode)
            navigate(`/${meetingCode}`)
        }
    }

    let handleCreateMeeting = async () => {
        const newMeetingCode = Math.random().toString(36).substring(2, 10);
        await addToUserHistory(newMeetingCode)
        navigate(`/${newMeetingCode}`)
    }

    return (
        <div className="homeContainer">
            <div className="colorBendsBackground">
                <ColorBends
                    colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
                    rotation={30}
                    speed={0.3}
                    scale={1.2}
                    frequency={1.4}
                    warpStrength={1.2}
                    mouseInfluence={0.8}
                    parallax={0.6}
                    noise={0.08}
                    transparent
                />
            </div>
            
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <VideoCallIcon sx={{ fontSize: 40, color: "#000" }} />
                    <div>
                        <h2 style={{ margin: 0, color: "#000", fontWeight: 700 }}>VideoCall Pro</h2>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                            Welcome !! {localStorage.getItem("username") || "User"}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Button 
                        startIcon={<RestoreIcon />}
                        onClick={() => navigate("/history")}
                        sx={{ textTransform: "none", color: "#000" }}
                    >
                        History
                    </Button>

                    <Button 
                        variant="outlined"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        sx={{ 
                            textTransform: "none",
                            borderColor: "#000",
                            color: "#000",
                            '&:hover': { borderColor: "#000", bgcolor: "rgba(0,0,0,0.05)" }
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div style={{ maxWidth: "600px" }}>
                        <h1 style={{ 
                            fontSize: "3rem", 
                            fontWeight: "700", 
                            marginBottom: "10px",
                            color: "#000"
                        }}>
                            Premium Video Meetings, Now Free for Everyone
                        </h1>

                        <p style={{ 
                            fontSize: "1.2rem", 
                            color: "#333", 
                            marginBottom: "25px",
                            lineHeight: "1.6"
                        }}>
                            Connect, collaborate, and celebrate from anywhere with secure, high-quality video calls.
                        </p>

                        <Card sx={{ 
                            marginBottom: "30px", 
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)", 
                            borderRadius: "12px",
                            bgcolor: "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(10px)"
                        }}>
                            <CardContent>
                                <h3 style={{ marginBottom: "15px", color: "#000" }}>Join a Meeting</h3>
                                <div style={{ display: 'flex', gap: "10px", flexWrap: "wrap" }}>
                                    <TextField 
                                        value={meetingCode}
                                        onChange={e => setMeetingCode(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinVideoCall()}
                                        id="meeting-code" 
                                        label="Enter Meeting Code" 
                                        variant="outlined"
                                        size="medium"
                                        sx={{ 
                                            flex: 1, 
                                            minWidth: "200px",
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: "#000" },
                                                '&:hover fieldset': { borderColor: "#000" },
                                                '&.Mui-focused fieldset': { borderColor: "#000" }
                                            },
                                            '& .MuiInputLabel-root': { color: "#666" },
                                            '& .MuiInputLabel-root.Mui-focused': { color: "#000" }
                                        }}
                                    />
                                    <Button 
                                        onClick={handleJoinVideoCall} 
                                        variant='contained'
                                        startIcon={<MeetingRoomIcon />}
                                        size="large"
                                        disabled={!meetingCode.trim()}
                                        sx={{ 
                                            textTransform: "none",
                                            paddingX: "30px",
                                            bgcolor: "#000",
                                            '&:hover': { bgcolor: "#333" }
                                        }}
                                    >
                                        Join
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div style={{ textAlign: "center" }}>
                            <p style={{ color: "#666", marginBottom: "15px" }}>Or</p>
                            <Button 
                                onClick={handleCreateMeeting}
                                variant='contained'
                                startIcon={<VideoCallIcon />}
                                size="large"
                                sx={{ 
                                    textTransform: "none",
                                    paddingX: "40px",
                                    paddingY: "12px",
                                    fontSize: "1.1rem",
                                    bgcolor: "#070606ff",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                                    '&:hover': {
                                        bgcolor: "#333",
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
                                    }
                                }}
                            >
                                Start New Meeting
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/VideoCallLobby.png' alt="Video Call Illustration" style={{ maxWidth: "500px", width: "100%" }} />
                </div>
            </div>
        </div>
    )
}

export default withAuth(Home)