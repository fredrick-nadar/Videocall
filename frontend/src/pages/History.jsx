import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import ColorBends from '../components/ColorBends';
import "../App.css";

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                console.log('Fetching history...');
                const history = await getHistoryOfUser();
                console.log('History received:', history);
                setMeetings(history || []);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`
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
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Button 
                        startIcon={<HomeIcon />}
                        onClick={() => routeTo("/home")}
                        sx={{ textTransform: "none", color: "#000" }}
                    >
                        Home
                    </Button>

                    <Button 
                        variant="outlined"
                        onClick={() => {
                            localStorage.removeItem("token")
                            routeTo("/auth")
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

            <div style={{ 
                padding: "40px 20px", 
                maxWidth: "1200px", 
                margin: "0 auto",
                position: "relative",
                zIndex: 1
            }}>
                <Box sx={{ marginBottom: "40px", textAlign: "center" }}>
                    <h1 style={{ 
                        fontSize: "2.5rem", 
                        fontWeight: "700", 
                        color: "#000",
                        marginBottom: "10px"
                    }}>
                        Meeting History
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "#333" }}>
                        View all your past video meetings here 
                    </p>
                </Box>

                {meetings.length === 0 ? (
                    <Card sx={{ 
                        maxWidth: "600px", 
                        margin: "0 auto",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)", 
                        borderRadius: "12px",
                        bgcolor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        padding: "40px",
                        textAlign: "center"
                    }}>
                        <CardContent>
                            <HistoryIcon sx={{ fontSize: 80, color: "#ccc", marginBottom: "20px" }} />
                            <Typography variant="h6" sx={{ color: "#666", marginBottom: "10px" }}>
                                No meeting history yet
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "20px"
                    }}>
                        {meetings.map((e, i) => (
                            <Card 
                                key={i} 
                                sx={{ 
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)", 
                                    borderRadius: "12px",
                                    bgcolor: "rgba(255,255,255,0.95)",
                                    backdropFilter: "blur(10px)",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    '&:hover': {
                                        transform: "translateY(-5px)",
                                        boxShadow: "0 12px 40px rgba(0,0,0,0.15)"
                                    }
                                }}
                            >
                                <CardContent>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: "#000",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}
                                    >
                                        <VideoCallIcon sx={{ color: "#070606ff" }} />
                                        Meeting {i + 1}
                                    </Typography>
                                    
                                    <Typography sx={{ 
                                        fontSize: 14, 
                                        color: "#666",
                                        marginBottom: "8px"
                                    }}>
                                        <strong>Code:</strong> {e.meetingCode}
                                    </Typography>

                                    <Typography sx={{ fontSize: 14, color: "#666" }}>
                                        <strong>Date:</strong> {formatDate(e.date)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}