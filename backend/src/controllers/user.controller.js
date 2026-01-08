import httpStatus from 'http-status';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Meetings from '../models/meeting.model.js';

const login = async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Username and password are required' });
    }
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) {
            let token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ message: 'Login successful', token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid password' });
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong during login: ${error.message}` });
    }
}

const register = async (req, res) => {
    try {
        const { username, password, name } = req.body;

        console.log('Registration request received:', { username, password: password ? '***' : undefined, name });

        // Validate input
        if (!username || !password || !name) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Username, password, and name are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Creating new user document...');
        
        const newUser = new User({
            username: username,
            password: hashedPassword,
            name: name
        });

        console.log('Attempting to save user to database...');
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser);
        
        return res.status(httpStatus.CREATED).json({ 
            message: 'User registered successfully',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                name: savedUser.name
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong during registration: ${error.message}`
        });
    }
}

const getUserHistory = async (req, res) => {
    const {token} = req.query;
    try{
        console.log('getUserHistory called with token:', token);
        const user = await User.findOne({token : token});
        if (!user) {
            console.log('User not found with token:', token);
            return res.status(httpStatus.NOT_FOUND).json({message: 'User not found'});
        }
        console.log('User found:', user.username);
        const meetings = await Meetings.find({user_id : user.username});
        console.log('Meetings found:', meetings.length, meetings);
        res.json(meetings);
    }catch(e){
        console.error('Error in getUserHistory:', e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: e.message});
    }
}

const addToHistory = async (req, res) => {
    const {token, meetingCode} = req.body;
    console.log('addToHistory called with:', { token, meetingCode });
    try{
        const user = await User.findOne({token : token});
        if (!user) {
            console.log('User not found with token:', token);
            return res.status(httpStatus.NOT_FOUND).json({message: 'User not found'});
        }
        console.log('User found:', user.username);
        const newMeeting = new Meetings({
            user_id : user.username,
            meetingCode : meetingCode
        });
        await newMeeting.save();
        console.log('Meeting saved successfully:', newMeeting);
        res.status(httpStatus.CREATED ).json({message: "Meeting added to history"});
    }catch(e){
        console.error('Error in addToHistory:', e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: e.message});
    }
}

export { login, register,getUserHistory, addToHistory };