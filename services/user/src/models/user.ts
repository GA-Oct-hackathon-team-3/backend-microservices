import mongoose, { ValidatorProps} from "mongoose";
import moment from 'moment-timezone';

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
    },
    timezone: {
        type: String,
        required: true,
        default: 'UTC',
        validate: {
            validator: function(v:string){
                return moment.tz.names().includes(v);
            },
            message: (props: ValidatorProps) => `${props.value} is not a valid timezone!`
        }
    },

}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);