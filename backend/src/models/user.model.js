import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    token: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },  
})

const User = mongoose.model("User", userSchema);
export default User;