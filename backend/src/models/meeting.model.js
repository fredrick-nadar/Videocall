import mongoose , { Schema } from "mongoose";

const meetingSchema = new Schema({
    user_id:{
        type:String
    },
    meetingCode: {
        type: String,
        required: true,
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