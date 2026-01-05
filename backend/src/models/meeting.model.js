import mongoose , { Schema } from "mongoose";

const meetingSchema = new Schema({
    user_id:{
        type:String
    },
    meeting_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },

})

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;