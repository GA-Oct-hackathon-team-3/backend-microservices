import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["female", "male", "other"],
        lowercase: true
    },
    tel: {
        type: Number,
    },
    photo: {
        type: String,
    },
    interests: [String],
    bio: {
        type: String,
        maxLength: 500,
        minLength: 3,
    },
    location: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);