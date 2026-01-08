import { createContext } from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { Route, useNavigate } from "react-router-dom";
import httpStatus from "http-status-codes";
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/user", // Replace with your backend URL
})

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(AuthContext);
  const handleRegister = async (name,username,password) => {
    try{
        console.log('Sending registration request:', { name, username, password: '***' });
        let request = await client.post("/register",{
            name:name,
            username : username,
            password: password
        })
        console.log('Registration response:', request);
    if(request.status === httpStatus.CREATED){
        return request.data.message;
    }
}catch(error) {
        console.error('Registration error:', error);
        console.error('Error response:', error.response);
        throw error;
    }
}

const handleLogin = async (username,password) => {
    try{
        let request = await client.post("/login",{
            username : username,
            password: password
        })
    if(request.status === httpStatus.OK){
        localStorage.setItem("token",request.data.token);
        return request.data.message || "Login successful";
        
    }
}catch(error) {
        throw error;
    }
}

const getHistoryOfUser = async() => {
    try{
        let request = await client.get("/get_all_activity",{
            params:{
                token: localStorage.getItem("token")
            }
        });
        return request.data;
    }catch(error) {
        throw error;
    }
}

    const addToUserHistory = async(meetingCode) => {
        try{
            console.log('Adding to user history:', meetingCode);
            let request = await client.post("/add_to_activity",{
                token: localStorage.getItem("token"),
                meetingCode: meetingCode
            });
            console.log('Added to history response:', request.data);
            return request.data;
        }catch(error) {
            console.error('Error adding to history:', error);
            throw error;
        }
    }

const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory
}
return  (
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
)
} 