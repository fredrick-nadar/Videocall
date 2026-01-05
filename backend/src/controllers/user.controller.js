import httpStatus from 'http-status';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username,
            password: hashedPassword,
            name: name
        });

        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.json({
            message: `Something went wrong during registration: ${error.message}`
        });
    }
}

export { login, register };